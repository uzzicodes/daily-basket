# Askari Departmental Store — Lahore Groceries

A Next.js App Router grocery storefront with a mobile-first Quick Basket layout, a refined navy/gold theme and accessible basket/overlay animations, the user’s original Askari logo, 18 Pakistani supermarket essentials, live search, department and brand filtering, four sorting modes, persistent cart, COD checkout, WhatsApp receipts and grocery-list sharing. The counter dashboard provides order stages, thermal packing slips and daily metrics. Discord is deferred as requested.

## Run locally

Install Node.js 22.13+ and run these commands from the project folder:

```sh
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local`. Open `http://localhost:3000`. Without configuration, the seed catalog and basket work; live order persistence is deliberately unavailable and the administrator layout can be previewed with no customer data.

## Connect Supabase

1. Create a Supabase PostgreSQL project.
2. Run the SQL files in `supabase/migrations/` in filename order. Run each schema migration once; seed insertion is safe to repeat. If older migrations are already installed, apply only the remaining timestamped migrations before deploying this source. The final migration restricts the dashboard's optional automatic-RLS event trigger to internal use.
3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. The service key is server-only; never use a `NEXT_PUBLIC_` prefix.
4. Set `ADMIN_PASSWORD` to a strong store-counter password. Set `ADMIN_SESSION_SECRET` to a random secret of at least 32 characters. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` on your own machine and keep it private.
5. `STORE_WHATSAPP_NUMBER` defaults to the store number the user supplied: `923084555567` (+92 308 4555567). Override it only if the store contact changes.
   Keep `CATALOG_PREVIEW=true` until the store reviews prices, ratings, discount references and stock. Set it to `false` after that review; the flag labels inventory without disabling saved COD orders.
6. Restart the dev server, place a test COD order and sign in at `/admin`. The counter polls every ten seconds. Test all four stages and a printed packing slip before opening to customers.

Products, orders and request counters use RLS with no anonymous write or read privileges. Only server requests access them. The database transaction locks the relevant catalog records, reads authoritative prices and stock, computes delivery and totals, snapshots the ordered items, and enforces idempotency. The shopper's displayed total is compared with the server total; a mismatch saves no order and asks the customer to refresh prices and review the basket. The displayed total never determines the price charged. Retries return the complete original saved total even if catalog prices or stock subsequently change. The success screen shows the saved COD total. Administrative status updates compare the prior status to prevent two counter sessions overwriting one another.

The counter loads 200 orders per page using both timestamp and order ID, preserving PostgreSQL microseconds. Orders sharing a timestamp cannot be skipped. Its ten-second refresh reloads the pages staff have opened so older orders also show status changes. Interrupted loads keep the prior pipeline and offer a refresh; signing out cancels pending reads.

The server relies on hosting-provided client IP headers for durable limits: checkout allows ten attempts per 15 minutes, login five. On other hosts, adapt the trusted IP header in `lib/rate-limit.ts`; absent trusted headers use a shared conservative bucket. Clean stale `api_limits` rows daily using the SQL comment in the migration.

## WhatsApp and paper lists

Basket ordering validates the name, Pakistani mobile number, Lahore area and street address, then opens WhatsApp with the store name, customer info, line items, delivery fee and COD total. The store confirms stock and delivery time. WhatsApp orders are not also saved as web orders, preventing accidental duplicates.

Typed lists open WhatsApp directly. Handwritten-photo lists use the device’s native file sharing where supported; the customer chooses WhatsApp and the store chat. A `wa.me` link cannot attach a local photo automatically, so desktop customers attach it in WhatsApp after it opens. No list photos or customer data are uploaded to an unconfigured server.

## Counter metrics

Gross revenue is the total of today’s orders, including delivery. Order count includes all stages. Collected COD counts Delivered orders. The estimated profit share is merchandise subtotal × 10% average margin × 50%; delivery fees are excluded. All daily boundaries and counter timestamps use Asia/Karachi. This is an estimate, not an accounting ledger.

## Deploy to Vercel

1. Upload this Next.js source to your own Git repository.
2. Import the repository into Vercel, choose Next.js, and use `npm run build` with the project root directory.
3. Add the same environment variables in the Vercel project settings. Keep all credentials marked secret/server-only. `APP_ORIGIN` is optional; set it to your final HTTPS origin if your reverse proxy rewrites hosts.
4. Deploy, then test browsing, one COD order, admin authentication, status changes, receipt printing and WhatsApp on a phone.

Vercel’s free Hobby plan is for personal, non-commercial use. A live business store needs an eligible commercial plan; do not assume Hobby covers this supermarket. See [Vercel Hobby](https://vercel.com/docs/plans/hobby) and [fair-use guidelines](https://vercel.com/docs/limits/fair-use-guidelines). The source remains suitable for other Next.js hosting environments.

## Validation

```sh
npm run typecheck
npm test
npm run build
```

Tests run the migration files in an isolated PGlite PostgreSQL engine, including seed inventory, private-role permissions, price-change rejection, immutable checkout retries, stock/quantity validation, exact delivery thresholds, 450 orders sharing a timestamp, Karachi day boundaries and rate-limit expiry. Other tests cover phone and area validation, receipt contents, session tampering, cross-origin requests and failure without persistence. The test dependency is used only for local validation and is not part of the deployed database.

The Askari Supabase project is provisioned in Mumbai on the Free plan. Migrations and a transaction that rolls back verified authoritative checkout totals, complete idempotent responses and server-only access on the real project. The security advisor's public execution warnings for the dashboard's automatic-RLS helper were fixed. Its remaining [RLS-without-policy information](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) is intentional: anonymous and signed-in API roles have no table or checkout privileges, and only the server key accesses these tables. Empty-database unused-index notices are informational.

Browser checks cover desktop/mobile layouts and the storefront-to-counter flow against an isolated local PostgreSQL adapter: price refresh preserves the address form, successful COD orders show the saved total, retries create one order, all delivery stages work, packing slips open, older orders refresh and signing out blocks admin access. Actual Supabase hosting and WhatsApp handoff still require the store's configuration and account setup.

Impeccable review corrected the mobile logo clearance, preview-catalog disclosure, exact delivery wording and native-share store title. Its installed engine does not support the skill’s internal 16-hex seed-reference verification, so that metadata check is recorded as a tooling limitation rather than asserted as passed.

## Before live sales

Review seed prices, discount reference prices, ratings and stock against the store’s own inventory. Source URLs are recorded in `public/product-image-sources.json`; replace or license retailer photos as appropriate. The supplied Askari logo is preserved with transparent padding cropped only by CSS. Confirm the advertised 45-minute service is operational and the Rs. 2,999 free-delivery threshold / Rs. 150 delivery fee are correct. Replace demonstration inventory before launch.

## Hosted private preview

The workspace also includes optional Sites/Vinext tooling for the private preview. The downloadable source uses standard Next.js for local development and Vercel. No credentials are embedded in the source. Discord integration is intentionally deferred.
