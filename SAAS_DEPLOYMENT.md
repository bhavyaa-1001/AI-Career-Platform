# SaaS Platform Deployment Guide

Production deployment checklist for subscriptions, Stripe billing, usage limits, and the SaaS admin layer.

## Architecture Overview

```
client/          React 19 + Vite + Tailwind + Redux + TanStack Query
server/
  src/
    config/      saasConstants.js, stripe.js, env.js
    models/saas/ BillingAccount, UsageRecord, Invoice, Payment, Coupon, Referral, Organization, etc.
    services/saas/ billing, usage, stripe, referrals, settings, developer, admin SaaS
    routes/v1/   /billing/*, /admin/saas/*, usage middleware on feature routes
    middleware/  usageEnforcement.js
```

## Environment Variables

### Server (`.env`)

```env
# Required
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CLIENT_URL=https://your-app.com

# Stripe (production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (transactional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=...
EMAIL_FROM=billing@your-app.com
```

### Client (`.env`)

```env
VITE_API_BASE_URL=https://api.your-app.com/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Database Setup

1. Run MongoDB migrations implicitly via Mongoose on first boot.
2. Seed SaaS plans:

```bash
cd server
npm run seed:saas-plans
```

This creates **Free**, **Starter**, **Pro**, and **Enterprise** plans with configurable limits.

## Stripe Configuration

### Test mode (development)

1. In [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys), enable **Test mode** (toggle top-right).
2. Copy **test** keys into `server/.env`:

```env
STRIPE_MODE=test
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=          # optional for local — see below
```

3. Copy the same publishable key to `client/.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

4. **Test card:** `4242 4242 4242 4242` — any future expiry, any CVC, any billing ZIP.

5. **Without webhooks (quickest):** After checkout, the app confirms the session via `/billing/checkout/confirm` when Stripe redirects back with `session_id`.

6. **With webhooks (recommended):** Install [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```bash
cd server
npm run stripe:listen
```

Paste the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET` and restart the server.

### Production (live mode)

1. Create Products and Prices in Stripe Dashboard (or let checkout use dynamic `price_data`).
2. Optionally map `stripePriceId` on each `Plan` document in MongoDB.
3. Enable **Customer Portal** in Stripe Dashboard (Settings → Billing → Customer portal).
4. Create webhook endpoint:

   **URL:** `https://api.your-app.com/api/v1/billing/webhook`

   **Events:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

## Usage Limits

Limits are enforced via middleware on these routes (no changes to existing module code):

| Route | Metric |
|-------|--------|
| `/analysis`, `/resume-match`, `/cover-letters` | `aiCredits` |
| `/resumes` | `resumeCount` |
| `/coding` | `codingSubmissions` |
| `/jobs` | `jobApplications` |

Admins bypass limits. Usage resets monthly (YYYY-MM period).

## API Endpoints

### User Billing (`/api/v1/billing`)

- `GET /plans` — public plan list
- `GET /overview`, `/usage` — authenticated
- `POST /checkout`, `/portal`, `/cancel`
- `GET /payments`, `/invoices`
- Referrals, organizations, settings, developer APIs under same prefix

### Admin SaaS (`/api/v1/admin/saas`)

- Revenue dashboard, plan management, coupons, subscriptions, payments/refunds, referrals

## Frontend Routes

| Path | Page |
|------|------|
| `/pricing` | Public pricing |
| `/billing` | Subscription dashboard |
| `/settings` | Account settings (theme, 2FA, privacy, export/delete) |
| `/referrals` | Referral program |
| `/developer` | API keys & webhooks |
| `/admin/saas` | Admin revenue & billing management |

## Deployment Steps

1. **Build client:** `cd client && npm run build`
2. **Deploy server:** Node 20+, `npm start`
3. **Reverse proxy:** Route `/api` to Express; serve static client build
4. **HTTPS:** Required for Stripe and secure cookies
5. **Seed plans:** `npm run seed:saas-plans`
6. **Configure Stripe webhook** pointing to production URL
7. **Verify:** Register user → free plan assigned → usage tracked → upgrade via `/pricing`

## Testing

```bash
cd server
node --test tests/saas.test.js
```

## Security Notes

- Webhook route uses raw body parser (before JSON middleware)
- API keys stored as SHA-256 hashes; raw key shown once on creation
- 2FA via TOTP (speakeasy)
- RBAC: admin/sub_admin for SaaS admin routes; org roles for team accounts
- Password required for account deletion

## Scalability

- Usage records sharded by `userId + period` index
- Stripe handles payment PCI compliance
- Stateless API — horizontal scaling behind load balancer
- Webhook idempotency via Stripe event IDs on Invoice/Payment upserts
