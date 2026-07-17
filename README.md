# Classify AI Commerce OS

AI-powered commerce backend: profit-sharing engine, fraud detection, affiliate
auto-sync scheduler, and order processing with Stripe (payments) and DHL
(shipping).

## Project structure

```
classify-ai-commerce-os/
├── src/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── middleware/
│   │   └── auth.js             # JWT auth + API key check
│   ├── models/
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── ApiKey.js
│   ├── routes/
│   │   ├── auth.js             # POST /auth/login
│   │   ├── apikeys.js          # POST /apikeys
│   │   ├── orders.js           # POST /orders
│   │   └── dashboard.js        # GET /dashboard/profits
│   ├── services/
│   │   ├── profitSharing.js
│   │   ├── fraudDetection.js
│   │   ├── seedApiKeys.js
│   │   └── affiliateSync.js
│   └── server.js               # App entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your real values:
   ```bash
   cp .env.example .env
   ```
3. Generate a bcrypt hash for your admin password (used for `/auth/login`):
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
   ```
   Put the result in `ADMIN_PASSWORD_HASH` in `.env`.
4. Run the server:
   ```bash
   npm start
   ```

## API endpoints

| Method | Path                | Auth              | Description                          |
|--------|---------------------|-------------------|--------------------------------------|
| POST   | `/auth/login`        | none              | Returns a JWT for the admin account   |
| POST   | `/apikeys`           | JWT (Bearer)      | Create a new API key for a platform   |
| POST   | `/orders`            | `x-api-key` header| Create an order (Stripe + DHL)        |
| GET    | `/dashboard/profits` | `x-api-key` header| Profit / fraud analytics              |

## Security notes (changes from the original draft)

This version fixes a few issues found in the original single-file script:

- **No hardcoded secrets.** Stripe key, JWT secret, DHL key, and all
  marketplace API keys now come from environment variables (`.env`), which is
  git-ignored. Never commit a real `.env` file.
- **No hardcoded admin password.** The original checked for a literal
  `"admin"` / `"123456"`. This version compares against a bcrypt hash stored
  in `ADMIN_PASSWORD_HASH`. For anything beyond a single personal admin
  account, replace this with a real `Users` collection with per-user hashed
  passwords.
- **API key creation requires a valid JWT** (previously it was a public,
  unauthenticated endpoint that anyone could call to mint themselves a key).
- **API keys are generated with `crypto.randomBytes`** instead of
  `Math.random()`, which is not cryptographically secure.

## Before deploying

- Set all variables in `.env` on your host (Render, Railway, Fly.io, a VPS,
  etc.) rather than relying on `.env.example` defaults.
- Point `MONGO_URI` at a real MongoDB instance (e.g. MongoDB Atlas) instead of
  `localhost`.
- Add request validation (e.g. `zod` or `joi`) on the `/orders` body before
  this goes anywhere near real payments.
- The Amazon/Alibaba affiliate endpoints in `affiliateSync.js` are
  placeholders — replace the URLs with the actual affiliate API endpoints you
  have access to.

## Uploading to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Classify AI Commerce OS"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```
