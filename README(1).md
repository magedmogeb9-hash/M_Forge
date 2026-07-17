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

## Troubleshooting: "it doesn't work after I uploaded it to GitHub"

**Important: GitHub only stores your code — it does not run it.** Pushing this
repo to GitHub does not start a server anywhere. To actually use the API, you
need to run `npm start` on your own machine, or deploy it to a host that runs
Node.js (Render, Railway, Fly.io, a VPS, etc.). Opening the GitHub repo page in
a browser will never show you a working API.

Two real bugs were found and fixed in this version:

1. **Server crashed instantly on startup if `STRIPE_SECRET_KEY` was missing.**
   The original code created the Stripe client at the top of `orders.js`
   (`require("stripe")(process.env.STRIPE_SECRET_KEY)`), which runs the moment
   the file is loaded — before the server even starts listening. Since `.env`
   is (correctly) git-ignored, a fresh clone from GitHub has no `.env` file,
   so `STRIPE_SECRET_KEY` was `undefined` and the whole process crashed on
   boot. **Fixed:** the Stripe client is now created lazily, only when
   `/orders` is actually called, with a clear error message if the key is
   missing — instead of taking down the entire server.
2. **Unclear MongoDB connection failures.** If `MONGO_URI` is missing or
   unreachable, the server now prints a specific hint (check your `.env`, or
   use a MongoDB Atlas connection string) instead of just an opaque driver
   error.

### After cloning from GitHub, you must still:

1. Run `npm install` — `node_modules/` is git-ignored on purpose (it's never
   committed), so a fresh clone has none of the dependencies installed yet.
2. Run `cp .env.example .env` and fill in real values — `.env` is also
   git-ignored (on purpose, so you never leak secrets), so none of your keys
   travel with the repo. Every environment (your laptop, a teammate's laptop,
   your production host) needs its own `.env`.
3. Generate `ADMIN_PASSWORD_HASH` with the bcrypt command in the Setup section
   above.
4. Point `MONGO_URI` at a real, reachable database (local MongoDB or MongoDB
   Atlas).

If you deploy to a host like Render or Railway, you set the same variables
from `.env.example` in that host's dashboard under "Environment Variables" —
not in a committed file.

## Uploading to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Classify AI Commerce OS"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```
