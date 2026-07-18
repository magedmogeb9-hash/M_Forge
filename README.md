# Classify AI Commerce OS

AI-powered commerce backend: profit-sharing engine, fraud detection, affiliate
auto-sync scheduler, product catalog, and order processing with Stripe
(payments) and DHL (shipping).

## What's new in this rebuild (v2)

This version was rebuilt from scratch and actually boot-tested (with stub
dependencies, since this environment has no network access) to confirm the
server reaches "listening" with no crashes, before being handed back to you.

**Bug fixed:**
- The server used to crash **instantly on startup** if `STRIPE_SECRET_KEY`
  was missing, because the Stripe client was created at module-load time.
  Since `.env` is git-ignored, a fresh `git clone` had no Stripe key and the
  whole process died before it could even start listening. Stripe is now
  initialized lazily, only when an order is actually created.

**Reliability fixes:**
- Every route is wrapped in an `asyncHandler`, so a failed database call
  returns a proper JSON error response instead of an unhandled promise
  rejection that can hang or crash the process.
- A centralized error-handling middleware (`middleware/errorHandler.js`)
  turns Mongoose validation/cast errors into clean 400 responses instead of
  generic 500s.
- `process.on("unhandledRejection"/"uncaughtException")` now log clearly
  instead of failing silently.

**New features added:**
- **Full Products CRUD** (`/products`) — this was completely missing before;
  orders referenced products, but there was no way to create one via the API.
- **Order listing + get-by-id** (`GET /orders`, `GET /orders/:id`) with
  pagination — previously you could only create an order or see aggregate
  dashboard stats, never look at individual orders.
- **API key listing + revocation** (`GET /apikeys`, `PATCH /apikeys/:id/revoke`).
- **Stock tracking**: creating an order now decrements product stock, and
  orders are rejected with `409` if stock is insufficient.
- **Basic request validation** on all write endpoints (no extra dependency).
- **Rate limiting** (`express-rate-limit`) to slow down abuse/brute force.
- **HTTP request logging** (`morgan`) so you can see traffic in your logs.
- **Configurable fraud thresholds** via `FRAUD_MAX_QTY` / `FRAUD_MAX_TOTAL`.
- One affiliate platform failing to sync no longer blocks the others.

## Project structure

```
classify-ai-commerce-os/
├── src/
│   ├── config/db.js               # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js                # JWT auth + API key check
│   │   └── errorHandler.js        # Central error handler + 404 handler
│   ├── models/                    # Product, Order, ApiKey
│   ├── routes/
│   │   ├── auth.js                # POST /auth/login
│   │   ├── apikeys.js             # GET/POST /apikeys, PATCH /apikeys/:id/revoke
│   │   ├── products.js            # Full CRUD /products
│   │   ├── orders.js              # GET/POST /orders, GET /orders/:id
│   │   └── dashboard.js           # GET /dashboard/profits
│   ├── services/                  # profit sharing, fraud, seed keys, affiliate sync
│   ├── utils/
│   │   ├── asyncHandler.js        # wraps async routes so errors reach the error handler
│   │   └── validate.js            # tiny dependency-free body validator
│   └── server.js                  # App entry point
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
3. Generate a bcrypt hash for your admin password:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
   ```
   Put the result in `ADMIN_PASSWORD_HASH` in `.env`.
4. Run the server:
   ```bash
   npm start
   ```
5. Confirm it's alive:
   ```bash
   curl http://localhost:5000/
   # {"status":"ok","service":"Classify AI Commerce OS","version":"2.0.0"}
   ```

## API endpoints

| Method | Path                    | Auth               | Description                       |
|--------|-------------------------|---------------------|------------------------------------|
| GET    | `/`                     | none                | Health check                      |
| POST   | `/auth/login`           | none                | Returns a JWT for the admin account|
| GET    | `/apikeys`              | JWT (Bearer)        | List API keys                     |
| POST   | `/apikeys`               | JWT (Bearer)        | Create a new API key for a platform|
| PATCH  | `/apikeys/:id/revoke`   | JWT (Bearer)        | Deactivate an API key             |
| GET    | `/products`             | `x-api-key`         | List products (filter by vendor/inStock)|
| GET    | `/products/:id`         | `x-api-key`         | Get a single product              |
| POST   | `/products`             | JWT (Bearer)        | Create a product                  |
| PATCH  | `/products/:id`         | JWT (Bearer)        | Update a product                  |
| DELETE | `/products/:id`         | JWT (Bearer)        | Delete a product                  |
| GET    | `/orders`               | `x-api-key`         | List orders (paginated)           |
| GET    | `/orders/:id`           | `x-api-key`         | Get a single order                |
| POST   | `/orders`               | `x-api-key`         | Create an order (Stripe + DHL)    |
| GET    | `/dashboard/profits`    | `x-api-key`         | Profit / fraud analytics          |

## Security notes

- **No hardcoded secrets.** Stripe key, JWT secret, DHL key, and all
  marketplace API keys come from environment variables (`.env`), git-ignored.
  Never commit a real `.env` file.
- **No hardcoded admin password.** Compared against a bcrypt hash in
  `ADMIN_PASSWORD_HASH`. For more than one admin, replace with a real `Users`
  collection with per-user hashed passwords.
- **API key creation/revocation requires a valid JWT.**
- **API keys are generated with `crypto.randomBytes`**, not `Math.random()`.

## Troubleshooting: "it doesn't work after I uploaded it to GitHub"

**GitHub only stores your code — it does not run it.** Pushing this repo to
GitHub does not start a server anywhere. To actually use the API, run
`npm start` locally, or deploy it to a host that runs Node.js (Render,
Railway, Fly.io, a VPS, etc.). Opening the repo page in a browser will never
show you a working API — you'll only ever see the README.

After cloning from GitHub, you must still:

1. Run `npm install` — `node_modules/` is git-ignored on purpose.
2. Run `cp .env.example .env` and fill in real values — `.env` is also
   git-ignored on purpose, so no secrets travel with the repo. Every
   environment (your laptop, a teammate's laptop, your production host) needs
   its own `.env`.
3. Generate `ADMIN_PASSWORD_HASH` with the bcrypt command above.
4. Point `MONGO_URI` at a real, reachable database (local MongoDB or MongoDB
   Atlas — a free cluster works fine for testing).

If you deploy to a host like Render or Railway, set the same variables from
`.env.example` in that host's dashboard under "Environment Variables" — not
in a committed file.

If the server still doesn't start after all of the above, run `npm start` and
send the **exact terminal output** — the error message tells us precisely
which step is failing (missing dependency, bad Mongo URI, wrong Node version,
etc.), which is impossible to diagnose from a GitHub screenshot alone since
GitHub never executes the code.

## Known placeholders / before real production use

- The Amazon/Alibaba URLs in `services/affiliateSync.js` are placeholders —
  swap in the real affiliate API endpoints you have access to.
- The DHL endpoint in `routes/orders.js` is illustrative; replace with DHL's
  actual shipment-creation API and request shape.
- Add automated tests before relying on this for real payments.

## Uploading to GitHub

```bash
git init
git add .
git commit -m "Classify AI Commerce OS v2"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```
