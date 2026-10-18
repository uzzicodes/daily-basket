# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

Native Android and iPhone customer shopping app alongside the existing website. The native extension is implemented in `mobile/`; `/app-preview` is a labelled browser preview, not a phone installation.

## Stack
User specified Next.js 14+ App Router, React, TypeScript, Tailwind CSS, Lucide React, Supabase PostgreSQL, React Context or Zustand, Discord webhook and WhatsApp links. Local installation and Vercel deployment instructions are required.

The native customer app uses Expo SDK 57, React Native and React Navigation with the existing Next.js/Supabase order backend. Its delivery-pin map uses a Leaflet/OpenStreetMap WebView; the shopping screens and navigation are native.

## Users
Confirmed in the user's pasted brief: Lahore households shopping for supermarket essentials, including customers who prefer handwritten grocery lists. Store-counter staff pack orders, manage deliveries, print slips and collect COD.

## Product Purpose
Build a full grocery-only e-commerce application for Lahore households, supplied by Askari Departmental Store. Daily Basket is the temporary customer-facing identity while the final name is pending. Customers find essentials, choose quantities, provide an address, and order with Cash on Delivery or WhatsApp.

## Operating Context
The brief prioritizes smartphone shopping. Deliver only within a 5 km straight-line radius of Askari Departmental Store, 84 Block C2, PGECHS Phase 1, Lahore (31.41216075, 74.27587375), as confirmed by the owner’s Google Maps link. A customer must choose an eligible delivery pin; the API and database both enforce the radius. Staff use a protected /orders desk on the store counter laptop. The owner has a separate protected /admin dashboard for sales and inventory.

## Capabilities and Constraints
Nine categories listed in the original brief, including laundry, cleaning, baby care and personal hygiene. No electronics, appliances, toys, clothing or mobile accessories. A comprehensive catalog within the nine grocery departments with verified source photography and Excel-driven availability. A banner-style storefront welcome and readable customer wordmark, followed by live search, category filters, four sorting modes, persistent basket, delivery-progress calculation, sliding checkout, list-by-photo or text, a staff order desk with exact product photos, pack-size and quantity checks, picture packing slips and owner-only COD settlement; a separate owner dashboard with daily metrics and inventory. The owner now requests automatic packing receipts in the selected Discord channel.

Delivery is free at Rs. 2,999 and above; below the threshold the fee is Rs. 150. The requested announcement advertises 45-minute express delivery. This is supplied copy, not an independently verified service promise. Live catalog prices are blank until the store imports its own price list; imported positive prices activate matched items and all other items remain out of stock.

## Brand Commitments
The user clarified on 18 October 2026 that Askari is the inventory source, not the customer brand, and revoked its name/logo for customer-facing branding. The user confirmed Daily Basket on 18 October 2026 as an explicitly temporary working identity with a simple teal basket icon and text wordmark; the final name remains open. Preserve real catalog brands, variant names, photography, contacts, imported prices and delivery operations. Internal storage namespaces, authentication headers, deployment URL and Site identity retain compatibility.

The current visual direction retains the established white/teal storefront and Poppins website typography. The user selected Everyday Market from three code sketches for the native app refinement: compact locality/search opening, photographic banners, horizontal departments and useful pack shelves. Native typography uses platform system fonts and supports light/dark appearance. The earlier Al-Barakah brief, supplier logo, Quick Basket choice, emerald/gold explorations and Al-Fatah/Naheed references are historical context, not instructions to restore a supplier identity. Find a brand filtering remains removed; real product brand labels remain.

## Evidence on Hand
Original brief in the user attachment. 18 product-image URLs verified to return image responses; sources recorded in work/image-sources.json. The historical supplier-logo source is public/askari-logo.png; it is not the customer-facing mark. WhatsApp contact is the user-provided 03084555567. Supabase project Askari Departmental Store (gxvkyigawrgdmvdhnjtc) is healthy in Mumbai in the user-selected organization. Schema and seed migrations are applied; checkout/idempotency and private permissions passed a rollback-only check against the real database. Server credentials and counter access are configured privately. Legacy demonstration products are archived. Catalog import rules keep unmatched/unpriced items unavailable; live stock and imported prices determine current selling availability. Inventory previews reject uncertain matches before saving.

## Product Principles
- Make everyday grocery shopping fast on phones.
- Preserve grocery-only scope and real product identity.
- Keep checkout totals authoritative on the server.
- Support the handwritten-list habit honestly.
- Never claim an order is saved when persistence is unavailable.

## Open Decisions
The user supplied 03084555567 as the WhatsApp contact; use international format 923084555567. Store inventory values and operational delivery capacity remain unconfirmed. Database and counter access are configured, and credentials are excluded from source. The owner has authorized automatic receipt delivery to the selected Askari incoming-orders Discord channel. The webhook is a server-only secret; no payment confirmation is available there.

Automatic WhatsApp slips were deferred after Meta required business verification. The user needs packing receipts on both Android and iPhone instead. Staff Web Push alerts open the existing private receipt, including saved product photos and quantities. Each phone must enable notification permission and pass a test; iPhone requires the Home Screen app on iOS 16.4+. Generic push copy excludes customer details. A durable per-device queue and a quiet Supabase Cron retry path keep sending independent of an open browser. Existing customer-initiated WhatsApp links remain available.

Storefront navigation now has separate category, search and product-detail pages. Home shows only available priced products. Original full photographic campaigns and nine round category images are documented in public/images/README.md; exact catalog photos remain authoritative. Staff have no cash-received/Delivered action on any device, including forged API requests. Shared packing slips use compact quantities/unit prices and line totals; PNG downloads support manual phone sharing.

## Native Customer Extension

The user requested actual Android/iPhone shopping apps for regular customers while retaining the website and backend. The app uses the temporary Daily Basket wordmark and basket icon, the established teal system, grocery photography and nine departments. Guest ordering requires no account or OTP. English/Urdu controls in Preferences, system/light/dark appearance selection, native five-tab navigation, favourites, product details, basket, delivery pin, COD checkout and per-device order history are implemented. Expanded Android windows use a left navigation rail. Reorder refreshes current prices and availability before replacing the basket.

The Everyday Market refinement adds local named checklists, product and basket snapshots saved to lists, current-stock list-to-basket merging, recent searches and viewed items, buy-again shelves, related products and a larger pack-photo modal. Written list entries remain text until linked to actual catalog products. Delivery-fee progress uses the real threshold; order steps reflect server statuses. Private customer receipt-PDF sharing uses the existing saved-snapshot renderer. These features do not add an account service, loyalty scheme, online payments or live rider tracking.

Delivery remains within the store's 5 km straight-line radius, with the existing Rs. 2,999 free-delivery threshold and Rs. 150 fee below it. The server remains authoritative for prices, stock, coverage and totals. Uncertain checkout retries preserve the original key and frozen order payload across restarts. Explicit price/stock rejection releases that attempt for basket review; uncertain responses retain it. Confirmed orders remain confirmed even if local history cannot be saved.

Native SecureStore holds private receipt access keys, optional remembered addresses and pending delivery details. Basket, favourites, language, appearance, named lists, recent searches/viewed items and recent receipt summaries are stored on the device. History does not sync between phones; customer receipt access expires after 90 days. The browser preview keeps private fields in session storage. Help/Preferences offers forgetting an address and clearing local shopping data, with pending attempts protected from accidental deletion. `/app-privacy` describes these behaviours. Optional foreground location is requested on tap; list photos and receipt PDFs use explicit sharing/download actions. There is no customer push notification implementation. Existing staff push, automatic private Discord picture-PDF receipts and owner-only cash settlement retain their separate roles.

The earlier native review was **ship at code/browser-preview scope only** after TypeScript, Android/iOS JavaScript exports and both checkout-retry fixes passed. The Everyday Market review and captures are in `.impeccable/review/market/`; its initial fix disposition covered the mobile website list invitation and stale supplier-brand documentation. Captures in both review folders show browser rendering only. Native device/simulator QA, permission handling, platform symbols, safe areas, enlarged text, native Back/gestures and performance remain unverified. The owner has completed Expo signup and approved this computer’s Expo CLI login. The app is linked to organization `daily-basket-lahore`, project `daily-basket-shopping`, ID `2d7cb415-af08-4f09-9694-ae38a7ae1c62`. The corrected internal Android APK build is tracked at https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-shopping/builds/e6f54180-3929-40d8-bd0f-7e3232dbcb2b. Expo Doctor passes all 21 checks after adding the required direct expo-font dependency. App-store publication and actual native device QA remain separate. Current native metadata uses Daily Basket, slug `daily-basket-shopping`, scheme `dailybasket` and package/bundle ID `pk.dailybasket.shopping`; confirm the final identity and identifiers before creating the first production signing/EAS project. Distribution still requires the owner's signing/accounts and native QA. See `mobile/README.md` for build and handoff instructions.
