# Doon Silk API

Production-ready Express + MongoDB backend for the Doon Silk storefront and separate admin console.

## Stack

- Node.js 20, Express, MongoDB, Mongoose
- JWT access/refresh tokens with HttpOnly cookie support
- RBAC: `user`, `admin`, `super_admin`
- Zod validation, centralized error handling, Pino logging
- Helmet, CORS, rate limiting, Mongo sanitization, XSS sanitization, optional CSRF
- Modular payment adapters for Razorpay, Stripe, and PayPal
- Swagger docs, Postman collection, PM2, Jest/Supertest

## Setup

```bash
cd apps/api
cp .env.example .env
npm install
npm run dev
```

API health check:

```bash
curl http://localhost:5000/healthz
```

Swagger:

```text
http://localhost:5000/api-docs
```

## Seed Products

The seed file mirrors the frontend's current Doon Silk catalog names, categories, and prices.

```bash
cd apps/api
npm run seed
```

## Frontend Integration Notes

The storefront and admin console are wired through `/api/v1` by default. For separate frontend/API domains, set:

```text
VITE_API_URL=https://your-api-domain.com/api/v1
```

Local allowed origins should include both apps:

```text
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174
```

Product list responses intentionally include frontend-friendly fields:

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": {
    "products": [
      {
        "id": 1,
        "mongoId": "...",
        "name": "Doon Silk Saree Royal Red",
        "category": "Sarees",
        "price": "₹6,499",
        "amount": 6499,
        "image": "...",
        "imageLarge": "..."
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 20,
    "totalPages": 1
  }
}
```

## Guest Cart

Guest cart APIs require an `x-guest-id` header. After login, call:

```http
POST /api/v1/cart/merge
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "guestId": "browser-generated-id" }
```

## Production

Use strong secrets in `.env`, configure storefront and admin CORS origins, set `COOKIE_SECURE=true`, and enable CSRF when the clients send `X-CSRF-Token`.

PM2:

```bash
cd apps/api
pm2 start ecosystem.config.cjs
```
