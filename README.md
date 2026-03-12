# LaunchKit

JSON to Landing Page generator

Part of the [CloudPipe](https://github.com/Jeffrey0117/CloudPipe) ecosystem.

## Quick Start

```bash
npm install
PORT=4020 node server.js
```

## Environment

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 4020) |

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/pages` | Create or update a landing page from JSON config (upsert by slug) |
| GET | `/api/pages` | List all landing pages (metadata only, no config blob) |
| DELETE | `/api/pages/{slug}` | Delete a landing page by slug |

## License

MIT
