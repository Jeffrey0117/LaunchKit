# LaunchKit

JSON-to-landing-page generator for the CloudPipe ecosystem. POST a JSON config, GET a fully server-rendered HTML landing page at `/:slug`.

## Stack

- Node.js, plain CommonJS (no framework, no build step)
- Built-in `http` module for the server (no Express)
- `better-sqlite3` for persistence (WAL mode)
- Zero client-side JS — pages are pure server-side rendered HTML + inline CSS

## Directory structure

```
server.js        ← HTTP server: routing, auth, CORS, request handling
db.js            ← SQLite connection (singleton) + `pages` table schema
templates.js     ← renderPage() / render404() — HTML string builders + inline CSS
data/            ← SQLite file lives here (data/launchkit.db), gitignored
.pm2-ecosystem.json ← PM2 process config (prod port 4020)
README.md / README.zh-TW.md
```

Only three source files. Keep it that way unless a feature genuinely warrants splitting.

## Key concepts / architecture

- **Single table**: `pages (slug PK, title, config TEXT, created_at, updated_at)`. The full page definition is stored as a JSON string in `config`.
- **Routing** is manual in `server.js`. Exact-match routes live in the `routes` map (`GET/POST /api/...`); dynamic routes (`DELETE /api/pages/:slug`, `GET /:slug`) are matched with regex/string checks after the map lookup.
- **Slug routing collision avoidance**: `GET /:slug` only handles single-segment, non-`/api/` paths ≤50 chars. Slugs cannot start with `api` (see `isValidSlug` + `SLUG_RE`).
- **Upsert semantics**: `POST /api/pages` uses `ON CONFLICT(slug) DO UPDATE` — re-POSTing a slug updates it rather than erroring.
- **Auth**: optional Bearer token via `LAUNCHKIT_TOKEN`. When the env var is empty, `requireAuth` returns `true` (open). Read/render of `GET /:slug` and `GET /api/health` are always public; write/list endpoints are gated.
- **Rendering** (`templates.js`): `renderPage(config, slug)` builds the page from optional config sections — `hero`, `social.stats`, `features`, `pricing` (single plan or `pricing.plans[]`), `urgency`, `faq`, `footer`, plus `theme` (colors / dark-light auto-detect) and `og` meta. Each section is omitted if its config is absent.
- **Raw-HTML escape hatch**: if `config.html` is a non-empty string, `renderPage` returns it verbatim (bypasses the JSON template).
- **XSS**: all interpolated user values go through `escapeHtml()`. The `config.html` escape hatch is the deliberate exception — treat its input as trusted.
- **DB singleton**: `getDb()` lazily creates the connection, `mkdir`s `data/`, sets pragmas, and creates the table on first call.

## Commands

```bash
npm install          # install deps (rebuilds better-sqlite3 native binding)
npm start            # node server.js
PORT=4020 node server.js
```

No test, lint, or build scripts are defined.

## Coding rules

- CommonJS (`require` / `module.exports`), not ESM.
- No external web framework — extend the `routes` map or the manual matchers in `server.js`.
- Always pass user-supplied strings through `escapeHtml()` before embedding in HTML.
- Validate slugs with `isValidSlug` before any DB write; validate request bodies in the route handler and return JSON `{ error }` with the right status.
- Use parameterized statements (`db.prepare(...).run(?, ?)`) — never string-interpolate SQL.
- Keep the project to its three small files; this is intentionally a minimal, dependency-light service.
