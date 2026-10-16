# ShopWave backend

The backend is a Node.js and Express REST API that requires MySQL.

## Configure MySQL

1. Start your MySQL server.
2. Run `schema.sql` in your MySQL client to create the `shopwave` database,
   tables, and initial categories.
3. Copy `.env.example` to `.env`, set your MySQL connection values, and replace
   `JWT_SECRET` with a random value (for example, generate one with
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
4. Set `FRONTEND_ORIGINS` to the comma-separated browser origins allowed to call
   the API. Localhost and `127.0.0.1` development origins are allowed by default.
5. Set both Razorpay keys to enable checkout. Leave them blank to disable payment
   endpoints until gateway credentials are configured.

The backend checks its MySQL connection before listening and exits with an
error if MySQL is unavailable. It does not use an in-memory database fallback.

Checkout reserves product stock immediately. Unpaid orders expire after 15
minutes and their reserved quantities are returned; expiry runs at startup,
every minute, and before checkout/payment-order creation. Admin cancellation of
a pending order also returns its reserved stock.

## Run locally

```bash
npm ci
npm start
```

The API listens on port `5000` by default.

For development with automatic restart on file changes, use `npm run dev`
(Node.js 20.13 or later).

## Local roles and catalog data

Public registration creates customer accounts only. To bootstrap the first local
administrator, register an account, then promote it directly in MySQL:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

Sign in again to refresh the role in the JWT. From the admin dashboard, promote
another account to `SELLER`; that seller can add products using the categories
currently present in the database. The catalog starts empty apart from its
default categories.

To provision or migrate the initial 12-product catalog across the seeded
categories, run:

```bash
npm run seed:catalog
```

The command is safe to re-run: it converts the existing demo catalog to
purchasable listings once, then leaves their prices and stock untouched on
later runs. The initial catalog prices and quantities have been approved as
live listings. Update inventory through the seller dashboard as sales occur.
Customers can place orders and pay through Razorpay when valid live gateway
credentials are configured. Live checkout collects and stores a delivery
address with each order. The command creates a seller account if needed and
prints its one-time password; store it securely if you want to sign in.
Confirm product authenticity, fulfillment, and any applicable seller/contact
details before accepting and shipping customer orders.

The local environment was last verified with Razorpay **test-mode** credentials
(`rzp_test_...`), so checkout opens Razorpay's sandbox and cannot collect a real
payment. To accept actual payments, configure Razorpay live keys
(`rzp_live_...`) and the matching live secret in `.env`; never commit those
credentials. Run a live payment only after the merchant account and fulfilment
process are ready.

To bring over products from another computer, export the old `shopwave` database
with `mysqldump` and import that backup on this computer. Creating the schema on
a new machine does not copy the old machine's product records.
