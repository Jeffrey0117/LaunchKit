const http = require('http');
const { URL } = require('url');
const { getDb } = require('./db');
const { renderPage, render404 } = require('./templates');

const PORT = parseInt(process.env.PORT || '4020', 10);
const TOKEN = process.env.LAUNCHKIT_TOKEN || '';

// ─── Helpers ───

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function json(res, status, data) {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(payload);
}

function html(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

function requireAuth(req) {
  if (!TOKEN) return true;
  const auth = req.headers.authorization || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return bearer === TOKEN;
}

// ─── Slug Validation ───

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,48}[a-z0-9]$/;

function isValidSlug(slug) {
  if (!slug || slug.length < 2 || slug.length > 50) return false;
  if (slug.startsWith('api')) return false;
  if (slug.includes('--')) return false;
  return SLUG_RE.test(slug);
}

// ─── Routes ───

const routes = {
  'GET /api/health': async (_req, res) => {
    const db = getDb();
    const { total } = db.prepare('SELECT COUNT(*) as total FROM pages').get();
    json(res, 200, { status: 'ok', service: 'launchkit', totalPages: total });
  },

  'POST /api/pages': async (req, res) => {
    if (!requireAuth(req)) {
      return json(res, 401, { error: 'Unauthorized' });
    }

    const body = await readBody(req);
    const { slug, title, config } = body;

    if (!slug || !isValidSlug(slug)) {
      return json(res, 400, {
        error: 'Invalid slug. Must be 2-50 chars, lowercase alphanumeric + hyphens, cannot start with "api".',
      });
    }
    if (!title || typeof title !== 'string') {
      return json(res, 400, { error: 'title is required' });
    }
    if (!config || typeof config !== 'object') {
      return json(res, 400, { error: 'config object is required' });
    }

    const db = getDb();
    db.prepare(`
      INSERT INTO pages (slug, title, config, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(slug) DO UPDATE SET
        title = excluded.title,
        config = excluded.config,
        updated_at = datetime('now')
    `).run(slug, title, JSON.stringify(config));

    json(res, 200, { success: true, slug, url: `/${slug}` });
  },

  'GET /api/pages': async (req, res) => {
    if (!requireAuth(req)) {
      return json(res, 401, { error: 'Unauthorized' });
    }

    const db = getDb();
    const pages = db.prepare(
      'SELECT slug, title, created_at, updated_at FROM pages ORDER BY updated_at DESC'
    ).all();

    json(res, 200, { pages });
  },
};

// ─── Server ───

const server = http.createServer(async (req, res) => {
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      });
      return res.end();
    }

    const parsed = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = parsed.pathname;
    const routeKey = `${req.method} ${pathname}`;

    // 1. Exact route match
    if (routes[routeKey]) {
      return await routes[routeKey](req, res);
    }

    // 2. DELETE /api/pages/:slug
    const deleteMatch = pathname.match(/^\/api\/pages\/([a-z0-9-]+)$/);
    if (req.method === 'DELETE' && deleteMatch) {
      if (!requireAuth(req)) {
        return json(res, 401, { error: 'Unauthorized' });
      }

      const slug = deleteMatch[1];
      const db = getDb();
      const result = db.prepare('DELETE FROM pages WHERE slug = ?').run(slug);

      if (result.changes === 0) {
        return json(res, 404, { error: 'Page not found' });
      }
      return json(res, 200, { success: true, deleted: slug });
    }

    // 3. GET /:slug — landing page render
    if (req.method === 'GET' && !pathname.startsWith('/api/')) {
      const slug = pathname.slice(1);

      // Only single-segment paths (no nested slashes)
      if (slug && !slug.includes('/') && slug.length <= 50) {
        const db = getDb();
        const row = db.prepare('SELECT config FROM pages WHERE slug = ?').get(slug);

        if (row) {
          const config = JSON.parse(row.config);
          return html(res, 200, renderPage(config, slug));
        }

        return html(res, 404, render404());
      }
    }

    // 4. Fallback
    json(res, 404, { error: 'Not found' });
  } catch (err) {
    const message = err && err.message ? err.message : 'Internal server error';
    json(res, 500, { error: message });
  }
});

server.listen(PORT, () => {
  console.log(`LaunchKit listening on :${PORT}`);
});
