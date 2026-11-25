# Daily Basket — online grocery store for a Lahore supermarket

A production grocery ordering system I built for a real neighbourhood store in PGECHS Phase 1, Lahore. Customers shop on the website or the Android app and pay cash on delivery. Staff pack, deliver and settle each order through role-based workspaces.

**Live site:** https://askari-lahore-groceries.jazzylark16.chatgpt.site · **Android app:** download from [`/apps`](https://askari-lahore-groceries.jazzylark16.chatgpt.site/apps)

## What it does

**For customers**
- A catalogue of nine departments with live search, product photos, favourites and a basket that survives reloads.
- Guest checkout with cash on delivery. Customers can drop a pin or use their live location, and the address fills itself in by reverse geocoding.
- A 7 km delivery radius, with the delivery fee calculated from the distance.
- Order tracking with a status timeline, plus a picture receipt.
- Ordering by WhatsApp, including sending a photo of a handwritten shopping list.
- English and Urdu, with right-to-left layout.

**For the store team** (one app, four roles)
| Role | Can do |
|---|---|
| Packer | Pick each item against a checklist, then mark the order packed |
| Rider | Pack, pick up and deliver; small teams can use a single rider login for all three |
| Manager | Order desk, cancellations, cash settlement, printing thermal bills (58/80 mm) |
| Admin (single owner login) | Everything above, plus staff accounts, product costs, expenses and profit reports |

- New-order alerts through Web Push and Discord PDF receipts, sent by a background queue in Supabase Cron with retries.
- Store bills formatted for 58 mm and 80 mm thermal receipt printers, printed from the browser or the Android app.
- Owner reports built from saved product costs, delivery costs and expenses. Reports group by day in the Asia/Karachi time zone, and test batches can be reset and undone.

## Engineering highlights

- **The server decides the price.** A single Postgres transaction locks the catalogue rows, reads the real prices and stock, calculates delivery and totals, saves a snapshot of the items and enforces an idempotency key. If the shopper's total differs from the server's, nothing is saved. Retries return the original saved total.
- **The order workflow lives in the database.** A single `perform_store_order_action` function checks role permissions, the order state and the expected version on every step (pack → dispatch → deliver → settle), and writes an audit event each time.
- **Row-level security on every table.** No anonymous reads or writes. The service key exists only on the server.
- **Authentication:**
  - Staff accounts each have their own password hash and credential version.
  - Sign-in is limited per username and per IP address.
  - The web app uses HttpOnly cookies; the native app uses bearer tokens kept in SecureStore.
  - Owner account recovery is supported.
- **Reliable paging.** Orders load 200 at a time using a timestamp-plus-ID cursor, so orders sharing a timestamp are never skipped.
- **Tests:** 77 Node tests. They include database tests that run every SQL migration in PGlite (Postgres in WebAssembly) and exercise the real role rules.
- **Mobile:**
  - Built with Expo and React Native, with a custom animated tab bar, skeleton loaders and haptics.
  - Animations respect the phone's reduced-motion setting.
  - Manager and admin screens open in an in-app WebView that can ask the phone to print a bill.
  - Android builds are made with EAS.

## Tech stack

| Area | Tools |
|---|---|
| Web | Next.js 16 (App Router, built with Vite), React 19, TypeScript, Tailwind CSS, Radix UI / shadcn, Zod, React Hook Form, Leaflet, Recharts |
| Backend | Next.js route handlers, Supabase Postgres (RLS, PL/pgSQL, pg_cron, pg_net, Vault), Drizzle |
| Mobile | Expo SDK 57, React Native, React Navigation 7, expo-location, expo-print, expo-secure-store, react-native-webview |
| Other | Web Push (VAPID), pdf-lib receipts, ExcelJS price-list import, Discord webhooks |
| Testing | Node test runner with tsx, PGlite |

## Project layout

```
app/          Next.js routes: storefront, /orders, /manage, /owner, /apps, API routes
components/   Storefront, order desk, operations portal and admin dashboard UI
lib/          Pricing, operations, auth, staff, receipts, rate limits, bills
supabase/     Ordered SQL migrations (schema, RLS, workflow functions, schedulers)
mobile/       Expo app for customers and staff (Android)
tests/        Unit, API and database tests
docs/         Setup and operations guides
```

## Run it locally

```sh
npm install
cp .env.example .env.local   # PowerShell: Copy-Item .env.example .env.local
npm run dev
npm test
```

With nothing configured, the store runs as a layout preview using sample products. To take real orders, see [docs/SETUP.md](docs/SETUP.md) (Supabase, staff accounts, phone alerts, deployment) and [docs/OPERATIONS.md](docs/OPERATIONS.md).

The mobile app is in [`mobile/`](mobile/README.md): `cd mobile && pnpm install && pnpm start`.

---

Built by **UZZi**.
