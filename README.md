# Askari Departmental Store — Lahore Groceries

A Next.js App Router grocery storefront with a mobile-first Quick Basket layout, an Al-Fatah-inspired white/teal theme with Poppins typography and accessible basket/overlay animations, the user’s original Askari logo, an expanded grocery catalog, live search, department filtering, four sorting modes, persistent cart, COD checkout, WhatsApp receipts and grocery-list sharing. The staff order desk at /orders shows immutable product photos, pack sizes and quantities alongside delivery details. It provides packing checks, picture packing slips and COD confirmation. The separate owner dashboard at /admin provides private daily metrics and inventory administration. Discord is deferred as requested.

## Run locally

Install Node.js 22.13+ and run these commands from the project folder:

```sh
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local`. Open `http://localhost:3000`. Without configuration, the seed catalog is an unpriced, out-of-stock layout preview; live order persistence is deliberately unavailable and the administrator layout can be previewed with no customer data.

## Connect Supabase

1. Create a Supabase PostgreSQL project.
2. Run the SQL files in `supabase/migrations/` in filename order. Run each schema migration once; seed insertion is safe to repeat. If older migrations are already installed, apply only the remaining timestamped migrations before deploying this source. The timestamped migrations also install private catalog paging and atomic price-list imports.
3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. The service key is server-only; never use a `NEXT_PUBLIC_` prefix.
4. Set `ADMIN_PASSWORD` to a strong owner-only password. Set `ADMIN_SESSION_SECRET` to a random secret of at least 32 characters. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` on your own machine and keep it private.
5. `STORE_WHATSAPP_NUMBER` defaults to the store number the user supplied: `923084555567` (+92 308 4555567). Override it only if the store contact changes.
   Product availability comes exclusively from the store’s imported price list. Retailer prices and ratings are never used.
6. Restart the dev server, place a test COD order and sign in at `/orders` with ORDER_DESK_PASSWORD. The order desk polls every ten seconds. Test all four stages and a printed packing slip before opening to customers.

Products, orders and request counters use RLS with no anonymous write or read privileges. Only server requests access them. The database transaction locks the relevant catalog records, reads authoritative prices and stock, computes delivery and totals, snapshots the ordered items, and enforces idempotency. The shopper's displayed total is compared with the server total; a mismatch saves no order and asks the customer to refresh prices and review the basket. The displayed total never determines the price charged. Retries return the complete original saved total even if catalog prices or stock subsequently change. The success screen shows the saved COD total. Administrative status updates compare the prior status to prevent two counter sessions overwriting one another.

The counter loads 200 orders per page using both timestamp and order ID, preserving PostgreSQL microseconds. Orders sharing a timestamp cannot be skipped. Its ten-second refresh reloads the pages staff have opened so older orders also show status changes. Interrupted loads keep the prior pipeline and offer a refresh; signing out cancels pending reads.

The server relies on hosting-provided client IP headers for durable limits: checkout allows ten attempts per 15 minutes, login five. On other hosts, adapt the trusted IP header in `lib/rate-limit.ts`; absent trusted headers use a shared conservative bucket. Clean stale `api_limits` rows daily using the SQL comment in the migration.

## WhatsApp and paper lists

### Packing receipts on Android and iPhone

Staff can receive Web Push alerts for new website orders without WhatsApp Business verification. Open `/orders` on each packer’s phone, sign in with the staff password, and tap **Phone alerts**. On iPhone (iOS 16.4+), first use Safari → Share → Add to Home Screen and open the resulting Askari Orders app. Android Chrome also supports installation from its menu. Enable alerts, allow the phone’s notification prompt, then use **Send test alert** to verify delivery on the actual phone.

Alerts contain a generic new-order message. Tapping one opens the exact saved receipt with photos, variants, quantities, delivery details and COD total, behind staff sign-in. Receipts also open by direct order ID even when they are outside the currently loaded queue. An expired staff session requires signing in again; sessions retain their existing eight-hour lifetime. No order or customer data is cached for offline use. Signing out removes this device from future alerts; **Turn off on this device** is also available in Phone alerts.

The order transaction creates one private queue entry per registered device. Successful checkout schedules background dispatch, and Supabase Cron retries due entries every minute without depending on an open browser. No HTTP request runs when the queue is empty. Retries are capped at five attempts per device; accepted alerts are not retried. Expired push endpoints are removed. Browser notification tags and Web Push topics coalesce the same order across ambiguous network retries, but push delivery is not a guaranteed alarm. Internet, notification permission, Focus modes and battery settings affect delivery. Devices expire after 30 days without opening the authenticated desk; completed queue records are retained for seven days. Device registrations are capped at 20.

For a separate deployment, run `node scripts/setup-phone-alerts.mjs`, set `DESK_PUSH_SUBJECT` to your business contact, and configure its four `DESK_PUSH_*` values as server environment variables. Apply the phone alert and scheduler migrations in order. In Supabase Vault, set `askari_desk_alert_url` to `https://YOUR-SITE/api/internal/desk-alerts` and `askari_desk_alert_secret` to the same private dispatch secret. The scheduler requires Supabase’s pg_cron, pg_net and Vault extensions. Keep the private key and dispatch secret out of public source and frontend environment variables. The hosted Askari site has these settings configured; each actual phone still needs activation and a successful test.

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

Browser checks cover desktop/mobile layouts and the storefront-to-counter flow against an isolated local PostgreSQL adapter: price refresh preserves the address form, successful COD orders show the saved total, retries create one order, all delivery stages work, packing slips open, older orders refresh and signing out blocks admin access. The actual hosted Supabase checkout and counter stages were subsequently verified; disposable test orders were removed. The expanded Excel template was downloaded and uploaded through the published counter, matching all catalog IDs without errors.

Impeccable review corrected the mobile logo clearance, preview-catalog disclosure, exact delivery wording and native-share store title. Its installed engine does not support the skill’s internal 16-hex seed-reference verification, so that metadata check is recorded as a tooling limitation rather than asserted as passed.

## Before live sales

Upload the store’s real selling-price file before accepting catalog orders. The supplied Askari logo remains unchanged. Catalog photography and provenance are retained in data/catalog; source availability can change. Confirm the advertised delivery time and fees against store operations.

## Hosted private preview

The workspace also includes optional Sites/Vinext tooling for the private preview. The downloadable source uses standard Next.js for local development and Vercel. No credentials are embedded in the source. Discord receipt delivery is optional and requires the server-only DISCORD_RECEIPT_WEBHOOK_URL.

## Full catalog and price-list inventory

The registered catalog contains 18,652 grocery/household/personal-care variants across 9 departments, collected from 50 public Al-Fatah collections across 151 pages. All 18,643 original photo URLs were verified on2026-10-12. Naheed.pk returned403 and was not bypassed. Source titles, URLs, IDs and barcode candidate provenance are retained in data/catalog. Images remain hosted by their source CDN.

No external retailer prices or ratings are used. All newly registered products start unpriced and out of stock. In Store counter → Inventory, download the Excel template, fill Price with positive PKR amounts, upload .xlsx or .csv, review matches, then Apply prices & replace stock. Each upload represents the complete current price list. Omitted products and blank prices are out of stock. Unknown, ambiguous and duplicate rows block import until resolved with a catalog code.

The server pages products, so the full catalog is never sent to the homepage at once. Inventory is authenticated, same-origin and transactional, with revision checks and idempotent retries. Service credentials remain server-only. Run scripts/register-catalog.mjs with server environment variables after all migrations. It adds missing variants without overwriting existing prices. scripts/fetch-catalog.mjs reproduces the source collection into work/catalog.

## Separate staff and owner access

Set `ORDER_DESK_PASSWORD` to a different strong password from `ADMIN_PASSWORD`. Counter staff sign in at `/orders`. Owner-only sales and inventory remain at `/admin`; only the owner password opens it. Owner credentials can also sign into the desk, issuing a desk-scoped session. Staff tokens cannot be replayed as owner sessions. Both cookies are HttpOnly, SameSite Strict, Secure in production and expire after eight hours.

The order desk loads active orders separately from delivered history, 200 per page with stable timestamp/ID cursors, and refreshes all loaded pages every 10 seconds. No financial aggregates, inventory endpoints, cost fields or request hashes are exposed to staff. COD amounts and selling prices are included only for fulfillment and payment collection. Each product photo, name, size, quantity and price is read from the saved order snapshot. Failed photos show an explicit unavailable message. Packing checks are held in the current screen; refreshing or closing it resets the checks. Dispatch requires all lines checked. The desk cannot confirm cash or close deliveries. Only the owner dashboard can close an order after explicitly confirming cash handover. This is enforced by the server, including forged desk requests. Status transitions also use the expected prior status on the server to reject concurrent changes.

Sample mode uses fictional customers and demonstration prices from the original sample products. It never reads live customer data or sends status changes. Real profit requires product cost prices; the existing owner profit-share figure is explicitly an estimate, not actual profit.

## Delivery coverage

The owner limits delivery to a 5 km straight-line radius of the store pin: 31.41216075, 74.27587375, at 84 Block C2, PGECHS Phase 1, Lahore. Source: https://maps.app.goo.gl/Qezc8HXgwTKg2Hk66?g_st=ic. Apply the delivery-radius migration before opening the updated checkout. The same Haversine calculation runs in browser, API validation and private database checkout. Exactly 5 km is included. Missing, invalid and outside pins are rejected. Client-supplied distances are never trusted. Existing orders retain their original addresses; new orders snapshot coordinates and the calculated distance.

Customers can check coverage from the header without a priced basket. Leaflet 1.9.4 is loaded only when a map opens. OpenStreetMap tiles carry visible attribution and use normal browser caching; no tile prefetch, bulk download, paid map key or address-geocoding service is used. Customers can select a map pin, explicitly request device location, or enter coordinates. Delivery pins are held in page memory, not local storage. Coordinates appear in the staff order desk as a directions link and in WhatsApp requests.

The owner requested banner-style onboarding and a clearer main-screen logo. The storefront has a manually controlled merchandising carousel and a paper-list banner. Campaign banners and round category photos are original generated artwork, served locally in WebP. Artwork is illustrative, contains no invented discounts or availability claims, and is documented in public/images/README.md. Product cards and receipts retain exact catalog photography. The supplied original logo remains unchanged and is framed at a larger size.


## Shopping pages and packing receipts

Home shows available, priced products only. `/categories` lists nine departments; `/category/[slug]` opens a separate department page. `/shop?q=...` searches the full catalog. Product links open `/products/[name]--[id]` with the exact photo, brand, pack size, stock and price, a zoom view and related available items. The shared store layout keeps the basket across navigation. Product ingredients or nutrition are not invented when source data lacks them.

The staff desk includes compact picture packing slips and downloadable PDF and PNG receipts for manual sharing to WhatsApp or another app. All totals and photos come from the saved order snapshot. The packing receipt is not proof of payment; financial settlement remains owner-only on every device.

## Automatic Discord receipts

Apply the Discord receipt and scheduler migrations after the existing phone-alert migrations. Set `DISCORD_RECEIPT_WEBHOOK_URL` as a secret in the hosting environment, preserving the existing `DESK_PUSH_DISPATCH_SECRET`, wake URL and Cron job. Each newly saved order queues one private Discord delivery in the checkout transaction. No historical orders are replayed. The post-response sender attempts delivery immediately; the existing minute scheduler retries independently of an open browser. Phone alerts remain independent.

The Discord post includes customer contact/address, COD totals, a picture packing slip PDF containing every product photo, name, pack size, quantity, unit price, line total and COD total. The PDF comes from the same shared generator as Save PDF on the order desk. Long receipts paginate, photos are fetched with bounded size/time and safe destinations, and missing photos are explicitly labelled. The private order-desk link opens all photos and offers Save PDF, Save image or Print slip. Use a private staff-only channel. The webhook is never sent to the browser or included in source exports. Destinations are restricted to Discord, redirects are refused, and mentions are disabled. Leases prevent concurrent claims, confirmed message IDs are retained, and transient/rate-limit failures retry up to five attempts. As with external webhook delivery, an interrupted response after acceptance can cause a duplicate; the full order reference identifies it. Payment actions are not exposed in Discord. Manual WhatsApp sharing remains available; Discord does not automatically relay to WhatsApp.
