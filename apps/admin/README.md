# Doon Silk Admin Console

Separate admin app for managing Doon Silk operations against the existing Express API.

## Local Development

```bash
cd apps/admin
cp .env.example .env
npm install
npm run dev
```

Open:

```text
http://localhost:5174
```

Use the super admin credentials configured in `apps/api/.env`.

## Panels

- Dashboard and sales analytics
- Product CRUD, image upload, stock adjustment
- Order status management
- Categories and homepage banners
- Coupon management
- Customer role/status management
- Debug panel with API health, API base URL, token state, and request log

## Production

Build:

```bash
npm run build
```

Deploy `apps/admin/dist` as a separate static app, for example `https://admin.your-domain.com`.
Set:

```env
VITE_API_URL=https://api.your-domain.com/api/v1
VITE_STOREFRONT_URL=https://your-domain.com
VITE_ENABLE_CSRF=true
```

Add the admin origin to the API `CORS_ORIGINS`.
