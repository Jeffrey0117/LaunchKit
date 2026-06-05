/**
 * Data layer — Selfize-backed (寄生獸線路).
 *
 * Was local better-sqlite3; now stores landing pages in the user's own Selfize
 * REST DB so LaunchKit runs stateless on a free host (Render) with no native
 * module. `slug` is the user-facing key; Selfize assigns each record its own
 * UUID `id` + `created_at`/`updated_at`.
 */

const { makeSelfize } = require('./selfize-client');

const COLLECTION = 'launchkit_pages';

const PAGE_SCHEMA = [
  { name: 'slug', type: 'text' },
  { name: 'title', type: 'text' },
  { name: 'config', type: 'text' }, // JSON string
];

let sf;

/** Lazy singleton: build the Selfize client + ensure the collection exists. */
async function getSf() {
  if (sf) return sf;
  const client = makeSelfize();
  await client.ensureCollection(COLLECTION, PAGE_SCHEMA);
  sf = client;
  return sf;
}

async function countPages() {
  const client = await getSf();
  const { total, items } = await client.list(COLLECTION, 'limit=1');
  return typeof total === 'number' ? total : (items ? items.length : 0);
}

/** Insert or update a page by slug (mirrors the old ON CONFLICT upsert). */
async function upsertPage(slug, title, config) {
  const client = await getSf();
  const existing = await client.findOne(COLLECTION, 'slug', slug);
  const config_str = JSON.stringify(config);
  if (existing) return client.update(COLLECTION, existing.id, { title, config: config_str });
  return client.create(COLLECTION, { slug, title, config: config_str });
}

/** List pages (slug/title/timestamps), newest-updated first. */
async function listPages() {
  const client = await getSf();
  const { items } = await client.list(COLLECTION, 'limit=10000');
  return items
    .map((p) => ({ slug: p.slug, title: p.title, created_at: p.created_at, updated_at: p.updated_at }))
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
}

/** Delete a page by slug. Returns true if a row was removed. */
async function deletePage(slug) {
  const client = await getSf();
  const existing = await client.findOne(COLLECTION, 'slug', slug);
  if (!existing) return false;
  await client.remove(COLLECTION, existing.id);
  return true;
}

/** Get a page's raw `config` JSON string by slug (or null). */
async function getPageConfig(slug) {
  const client = await getSf();
  const row = await client.findOne(COLLECTION, 'slug', slug);
  return row ? row.config : null;
}

module.exports = { getSf, countPages, upsertPage, listPages, deletePage, getPageConfig };
