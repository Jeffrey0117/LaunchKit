# LaunchKit

> **[English README](README.md)**

CloudPipe 生態系的 Landing Page 產生器。一段 JSON 進去，一個完整的銷售頁出來。

```
POST /api/pages ─── JSON config ──> ┌─────────────┐
                                    │  LaunchKit   │
GET  /my-product ── 瀏覽器請求 ──> │  SSR 渲染    │──> 完整 HTML
                                    └─────────────┘
```

**定位**：生態系的「門面」。新產品上線不需要花時間切版，只要用 API 送一段 JSON（標題、功能清單、價格、CTA），LaunchKit 就即時渲染出一個專業的 Landing Page。搭配 PayGate 收款 + Mailer 發信，從點子到上線收費 < 1 天。

## 功能

- JSON → Landing Page：零 JS payload，純 SSR 渲染
- Responsive 設計：`clamp()` 字體 + `auto-fit` grid，手機 / 桌面自適應
- 完整頁面結構：Hero + Features Grid + Pricing Card + Footer
- OG / Twitter meta tags（社群分享預覽）
- 自訂色系（`theme.primaryColor`、`accentColor`、`bgColor`）
- Slug-based 路由：`GET /:slug` 直接瀏覽
- Upsert 語意：同一個 slug 重複 POST 會更新而非報錯
- XSS 防護：所有使用者輸入經過 `escapeHtml()` 處理
- SQLite 持久化（WAL mode, better-sqlite3）

## 快速啟動

```bash
npm install
cp .env.example .env   # 填入 token
PORT=4020 node server.js
```

## 環境變數

| 變數 | 必填 | 說明 |
|------|------|------|
| `PORT` | 否 | 伺服器端口（預設 4020）|
| `LAUNCHKIT_TOKEN` | 否 | Bearer 驗證 token（未設定 = 開放）|

## API

### `GET /api/health`

```bash
curl http://localhost:4020/api/health
```

```json
{ "status": "ok", "service": "launchkit", "totalPages": 5 }
```

### `POST /api/pages`

建立或更新 Landing Page（upsert by slug）。

```bash
curl -X POST http://localhost:4020/api/pages \
  -H "Authorization: Bearer $LAUNCHKIT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "pokkit-pro",
    "title": "Pokkit Pro",
    "config": {
      "hero": {
        "headline": "你的檔案，你的規則",
        "subheadline": "自架檔案分享平台，支援密碼保護、到期時間、廣告整合",
        "ctaText": "立即開始",
        "ctaUrl": "https://pokkit.isnowfriend.com",
        "imageUrl": "https://duk.tw/pokkit-hero.png"
      },
      "features": [
        { "icon": "🔒", "title": "密碼保護", "description": "每個檔案可設獨立密碼" },
        { "icon": "⏰", "title": "到期時間", "description": "1h / 1d / 7d / 30d / 永久" },
        { "icon": "📊", "title": "廣告整合", "description": "內建 AdMan 廣告位" }
      ],
      "pricing": {
        "currency": "NT$",
        "price": 990,
        "period": "永久授權",
        "features": ["原始碼交付", "無限檔案上傳", "自訂域名", "終身更新"],
        "ctaText": "購買原始碼",
        "ctaUrl": "https://classroo.tw/checkout/pokkit"
      },
      "og": {
        "title": "Pokkit Pro — 自架檔案分享",
        "description": "安全、快速、可自訂的檔案分享平台"
      },
      "theme": {
        "primaryColor": "#2563eb",
        "accentColor": "#7c3aed"
      },
      "footer": {
        "text": "Powered by CloudPipe",
        "links": [
          { "label": "GitHub", "url": "https://github.com/Jeffrey0117/Pokkit" }
        ]
      }
    }
  }'
```

```json
{ "success": true, "slug": "pokkit-pro", "url": "/pokkit-pro" }
```

### `GET /api/pages`

列出所有頁面（不含 config 內容）。

```bash
curl http://localhost:4020/api/pages \
  -H "Authorization: Bearer $LAUNCHKIT_TOKEN"
```

### `DELETE /api/pages/:slug`

刪除指定頁面。

```bash
curl -X DELETE http://localhost:4020/api/pages/pokkit-pro \
  -H "Authorization: Bearer $LAUNCHKIT_TOKEN"
```

### `GET /:slug`

瀏覽 Landing Page（公開，不需 auth）。

```
http://localhost:4020/pokkit-pro
```

## Page Config 結構

```json
{
  "hero": {
    "headline": "主標題",
    "subheadline": "副標題",
    "ctaText": "CTA 按鈕文字",
    "ctaUrl": "https://...",
    "imageUrl": "https://..."
  },
  "features": [
    { "icon": "🚀", "title": "功能名", "description": "功能說明" }
  ],
  "pricing": {
    "currency": "$",
    "price": 29,
    "period": "month",
    "features": ["功能一", "功能二"],
    "ctaText": "立即購買",
    "ctaUrl": "https://..."
  },
  "og": {
    "title": "OG 標題",
    "description": "OG 描述",
    "imageUrl": "https://..."
  },
  "theme": {
    "primaryColor": "#2563eb",
    "accentColor": "#7c3aed",
    "bgColor": "#ffffff"
  },
  "footer": {
    "text": "頁尾文字",
    "links": [{ "label": "連結", "url": "https://..." }]
  }
}
```

所有欄位皆為選填。未提供的 section 會自動省略。

## 跨服務呼叫

透過 CloudPipe Gateway SDK 建立頁面：

```javascript
const gw = require('../../sdk/gateway');

// 建立 Landing Page
await gw.call('launchkit_create_page', {
  slug: 'my-product',
  title: 'My Product',
  config: {
    hero: { headline: '最棒的產品', ctaText: '試試看', ctaUrl: '...' },
    pricing: { price: 299, currency: 'NT$', ctaText: '購買' },
  },
});
```

## 完整銷售流程

LaunchKit + PayGate + Mailer 三服務串連，形成完整的產品上線流程：

```
1. LaunchKit 建立銷售頁  ──>  用戶看到產品頁面
2. 用戶點擊「購買」CTA    ──>  跳轉金流平台（PayUni）
3. 付款成功               ──>  PayGate 接收 Webhook
4. PayGate 記錄購買       ──>  Mailer 發送確認信
5. 產品查詢 PayGate       ──>  確認用戶已付費，開通功能
```

## 技術架構

- **Runtime**: Node.js, CJS (`require` / `module.exports`)
- **HTTP**: Node 內建 `http` 模組（無框架）
- **DB**: `better-sqlite3`（WAL mode）
- **渲染**: 純 Server-Side Render，零 JS payload
- **CSS**: CSS Custom Properties + `clamp()` + responsive grid
- **安全**: `escapeHtml()` XSS 防護
- **Slug 規則**: 2-50 字元，小寫英數 + 連字號，不能以 `api` 開頭
- **程式碼**: `server.js`（186 行）+ `templates.js`（389 行）+ `db.js`（32 行）

## 授權

MIT
