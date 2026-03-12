# LaunchKit

> **[中文版 README](README.zh-TW.md)**

Landing page generator for the [CloudPipe](https://github.com/Jeffrey0117/CloudPipe) ecosystem. JSON in, professional landing page out.

```
POST /api/pages ─── JSON config ──> ┌─────────────┐
                                    │  LaunchKit   │
GET  /my-product ── browser ──────> │  SSR render  │──> full HTML
                                    └─────────────┘
```

No need to write HTML for new products — just POST a JSON config (title, features, pricing, CTA) and LaunchKit renders a professional landing page on the fly. Pair with PayGate for payments + Mailer for emails = idea to revenue in < 1 day.

## Features

- JSON to Landing Page: zero JS payload, pure server-side render
- Responsive design: `clamp()` typography + `auto-fit` grid
- Full page sections: Hero + Features Grid + Pricing Card + Footer
- OG / Twitter meta tags (social sharing previews)
- Custom theming (`theme.primaryColor`, `accentColor`, `bgColor`)
- Slug-based routing: `GET /:slug` serves the page directly
- Upsert semantics: re-POST same slug updates instead of erroring
- XSS protection: all user input passes through `escapeHtml()`
- SQLite persistence (WAL mode, better-sqlite3)

## Quick Start

```bash
npm install
cp .env.example .env   # fill in token
PORT=4020 node server.js
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 4020) |
| `LAUNCHKIT_TOKEN` | No | Bearer auth token (open when unset) |

## API

### `GET /api/health`

```bash
curl http://localhost:4020/api/health
```

```json
{ "status": "ok", "service": "launchkit", "totalPages": 5 }
```

### `POST /api/pages`

Create or update a landing page (upsert by slug).

```bash
curl -X POST http://localhost:4020/api/pages \
  -H "Authorization: Bearer $LAUNCHKIT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "pokkit-pro",
    "title": "Pokkit Pro",
    "config": {
      "hero": {
        "headline": "Your files, your rules",
        "subheadline": "Self-hosted file sharing with password protection and expiration",
        "ctaText": "Get Started",
        "ctaUrl": "https://pokkit.isnowfriend.com"
      },
      "features": [
        { "icon": "🔒", "title": "Password Protection", "description": "Independent password per file" },
        { "icon": "⏰", "title": "Expiration", "description": "1h / 1d / 7d / 30d / forever" },
        { "icon": "📊", "title": "Ad Integration", "description": "Built-in AdMan ad slots" }
      ],
      "pricing": {
        "currency": "NT$",
        "price": 990,
        "period": "lifetime",
        "features": ["Full source code", "Unlimited uploads", "Custom domain", "Lifetime updates"],
        "ctaText": "Buy Now",
        "ctaUrl": "https://classroo.tw/checkout/pokkit"
      },
      "theme": { "primaryColor": "#2563eb", "accentColor": "#7c3aed" },
      "footer": {
        "text": "Powered by CloudPipe",
        "links": [{ "label": "GitHub", "url": "https://github.com/Jeffrey0117/Pokkit" }]
      }
    }
  }'
```

```json
{ "success": true, "slug": "pokkit-pro", "url": "/pokkit-pro" }
```

### `GET /api/pages`

List all pages (metadata only, no config blob).

```bash
curl http://localhost:4020/api/pages \
  -H "Authorization: Bearer $LAUNCHKIT_TOKEN"
```

### `DELETE /api/pages/:slug`

Delete a landing page.

```bash
curl -X DELETE http://localhost:4020/api/pages/pokkit-pro \
  -H "Authorization: Bearer $LAUNCHKIT_TOKEN"
```

### `GET /:slug`

View a landing page (public, no auth).

```
http://localhost:4020/pokkit-pro
```

## Page Config Schema

```json
{
  "hero": {
    "headline": "Main headline",
    "subheadline": "Subtitle",
    "ctaText": "CTA button text",
    "ctaUrl": "https://...",
    "imageUrl": "https://..."
  },
  "features": [
    { "icon": "🚀", "title": "Feature name", "description": "Feature description" }
  ],
  "pricing": {
    "currency": "$",
    "price": 29,
    "period": "month",
    "features": ["Feature one", "Feature two"],
    "ctaText": "Buy Now",
    "ctaUrl": "https://..."
  },
  "og": {
    "title": "OG title",
    "description": "OG description",
    "imageUrl": "https://..."
  },
  "theme": {
    "primaryColor": "#2563eb",
    "accentColor": "#7c3aed",
    "bgColor": "#ffffff"
  },
  "footer": {
    "text": "Footer text",
    "links": [{ "label": "Link", "url": "https://..." }]
  }
}
```

All fields are optional. Missing sections are automatically omitted.

## Cross-Service Usage

Create pages via the CloudPipe Gateway SDK:

```javascript
const gw = require('../../sdk/gateway');

await gw.call('launchkit_create_page', {
  slug: 'my-product',
  title: 'My Product',
  config: {
    hero: { headline: 'The best product', ctaText: 'Try it', ctaUrl: '...' },
    pricing: { price: 299, currency: 'NT$', ctaText: 'Buy' },
  },
});
```

## End-to-End Sales Flow

LaunchKit + PayGate + Mailer form a complete product launch pipeline:

```
1. LaunchKit creates sales page  ──>  User sees product page
2. User clicks "Buy" CTA         ──>  Redirects to payment provider
3. Payment succeeds               ──>  PayGate receives webhook
4. PayGate records purchase       ──>  Mailer sends confirmation email
5. Product queries PayGate        ──>  Confirms user has paid, unlocks features
```

## Architecture

- **Runtime**: Node.js, CJS (`require` / `module.exports`)
- **HTTP**: Node built-in `http` module (no framework)
- **DB**: `better-sqlite3` (WAL mode)
- **Rendering**: Pure server-side render, zero JS payload
- **CSS**: CSS Custom Properties + `clamp()` + responsive grid
- **Security**: `escapeHtml()` XSS protection
- **Slug rules**: 2-50 chars, lowercase alphanumeric + hyphens, cannot start with `api`
- **Source**: `server.js` (186 lines) + `templates.js` (389 lines) + `db.js` (32 lines)

## License

MIT
