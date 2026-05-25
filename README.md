# Doon Silk MERN E-commerce

Existing Doon Silk React frontend plus production-ready Express/MongoDB backend.

## Local Development

Start the API:

```bash
cd apps/api
cp .env.example .env
npm install
npm run create:admin
npm run seed
npm run dev
```

Start the frontend:

```bash
cd apps/web
cp .env.example .env
npm install
npm run dev
```

Frontend requests use `/api/v1`; Vite proxies `/api` to `http://localhost:5000`.

## Required API Environment

For Atlas:

```env
MONGODB_URI=mongodb+srv://<db_user>:<encoded_password>@doon-silk.ybahakx.mongodb.net/doon_silk?retryWrites=true&w=majority&appName=Doon-silk
MONGODB_DB_NAME=doon_silk
```

Set strong production values for:

```env
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
COOKIE_SECRET=
CSRF_SECRET=
CORS_ORIGINS=
FRONTEND_URL=
COOKIE_SECURE=true
ENABLE_CSRF=true
```

## Production

Build the frontend and run the API with PM2, Render, Railway, Vercel + hosted API, or your preferred Node host. Set `VITE_API_URL` to your production API `/api/v1` URL when frontend and backend are on separate domains.

## Useful URLs

```text
Frontend: http://localhost:5173
API health: http://localhost:5000/healthz
Swagger: http://localhost:5000/api-docs
Products API: http://localhost:5000/api/v1/products
```

## Verification

```bash
cd apps/api && npm test
cd apps/web && npm run build
```
