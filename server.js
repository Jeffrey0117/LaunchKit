const http = require('http');
const { URL } = require('url');
const { countPages, upsertPage, listPages, deletePage, getPageConfig } = require('./db');
const { renderPage, render404 } = require('./templates');
const { renderTouchIcon } = require('./icon');

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
  // On-box callers (e.g. the cloudpipe MCP discovery, which hits localhost:PORT)
  // are trusted without a token. Public traffic arrives via the cloudpipe proxy
  // / Render, so its remoteAddress is never loopback — those writes MUST carry a
  // valid token. With no token set, non-loopback writes are blocked (closed by
  // default) so a public parasite host can't be defaced anonymously.
  const ra = (req.socket && req.socket.remoteAddress) || '';
  if (ra === '127.0.0.1' || ra === '::1' || ra === '::ffff:127.0.0.1') return true;
  if (!TOKEN) return false;
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
  'GET /apple-touch-icon.png': async (req, res) => {
    const q = new URL(req.url, `http://localhost:${PORT}`).searchParams;
    const png = renderTouchIcon(q.get('c'), q.get('a'));
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=604800, immutable',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(png);
  },

  'GET /api/health': async (_req, res) => {
    const total = await countPages();
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

    await upsertPage(slug, title, config);

    json(res, 200, { success: true, slug, url: `/${slug}` });
  },

  'GET /api/pages': async (req, res) => {
    if (!requireAuth(req)) {
      return json(res, 401, { error: 'Unauthorized' });
    }

    const pages = await listPages();

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
      const removed = await deletePage(slug);

      if (!removed) {
        return json(res, 404, { error: 'Page not found' });
      }
      return json(res, 200, { success: true, deleted: slug });
    }

    // 3. GET /:slug — landing page render
    if (req.method === 'GET' && !pathname.startsWith('/api/')) {
      const slug = pathname.slice(1);

      // Only single-segment paths (no nested slashes)
      if (slug && !slug.includes('/') && slug.length <= 50) {
        const configStr = await getPageConfig(slug);

        if (configStr) {
          const config = JSON.parse(configStr);
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
