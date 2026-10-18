# Daily Basket customer app

Real Expo / React Native screens for Android and iPhone. The existing Next.js website, Supabase catalogue, private staff desk, owner cash controls and automatic Discord picture-PDF receipts remain the shared backend. Only the delivery-pin map is a WebView (Leaflet/OpenStreetMap); the shopping UI and navigation are native.

## Run on a phone

Requirements: Node 22.13+ and pnpm. Install Expo Go **SDK 57** on the phone; the current Expo transition guide explicitly recommends SDK 57 for physical-device Expo Go. Both devices must reach the development machine, or use Expo's tunnel option.

```sh
cd mobile
pnpm install --frozen-lockfile
pnpm start
```

Scan the displayed QR code. Android can scan in Expo Go; iPhone can scan using Camera. Set `EXPO_PUBLIC_STORE_URL` only when using another deployed Daily Basket backend. Public checkout/config/status routes introduced by this change must be deployed before the phone app can order.

The app has guest checkout, not phone OTP authentication. Recent orders and favourites belong to this device; they do not sync to another phone. Customer receipt access expires after 90 days. Native receipt keys and opt-in saved addresses use SecureStore; the browser preview uses session storage for these private fields. An uncertain order keeps its original key and payload across restarts, preventing duplicate orders.

## Android installable test build

The project is linked to the owner’s Expo organization `daily-basket-lahore`, project `daily-basket-shopping` (ID `2d7cb415-af08-4f09-9694-ae38a7ae1c62`). Local CLI login is configured outside the repository. No private store/backend credentials belong in this app.

```sh
cd mobile
pnpm dlx eas-cli login
pnpm dlx eas-cli init
pnpm dlx eas-cli build --platform android --profile preview
```

The preview profile produces an APK installation link. Expo config carries the existing project ID and organization owner. The internal Android build uses `pk.dailybasket.shopping`; confirm the final name and identifiers before the first production release. Android production uses an AAB, uploaded through the owner's Google Play account. EAS cloud builds require the account owner's build/signing setup; an exported JS bundle is not an APK.

## iPhone

Expo Go can run the development app. For a standalone iPhone test app, the owner needs an Apple Developer account, EAS signing credentials and registered test devices or TestFlight. The `ios-simulator` profile builds for a Mac simulator and does not install on a physical iPhone. Production submission also requires the owner's App Store Connect setup. Nothing in this repository claims those accounts or store submissions are already complete.

## Checks and browser preview

```sh
pnpm typecheck
pnpm export:check
pnpm web:export
node scripts/prepare-preview.mjs
```

Serve the parent Next.js project and open `/app-preview`. This is explicitly a **browser preview**, useful for checking navigation and API behaviour. It does not verify native permissions, screen safe areas, native symbols, Android Back, iOS swipe gestures or device performance. Run native light/dark and enlarged-text checks on real devices/simulators before distribution.

The parent `pnpm test` suite checks checkout pricing/idempotency, permissions, receipt-token isolation, stock refresh and delivery coverage. No live test orders are submitted automatically by the mobile build.

## Privacy and handoff

The app collects delivery details only for orders. Foreground GPS is optional and requested on a button tap. Photo lists use the system picker and explicit system sharing. No card payments, customer account, background tracking or customer push notifications are implemented in this first version. Staff notifications and Discord PDFs continue through the existing server queue. Privacy: `/app-privacy` on the store URL.

App store release still needs native device QA, the owner's signing accounts, final store screenshots/listings and reviewed privacy/data-safety answers. Artwork provenance is in `assets/README.md` and the parent `public/images/README.md`.

## Working identity and shopping tools
Daily Basket is a temporary customer name, separate from the inventory supplier. Confirm the final name and app identifiers before the first EAS production project/signing setup. Historical on-device storage namespaces and the current live backend URL intentionally stay compatible.

The Everyday Market upgrade adds private on-device named checklists, basket-to-list saving, product-to-list saving, current-stock list additions, recent searches, recently viewed items, buy-again shelves, appearance preferences, English/Urdu copy, related products, photo enlargement, delivery-fee progress, order status steps and token-protected receipt PDF sharing. No loyalty balance, online payment, live rider location or account synchronisation is claimed. Native file sharing still requires device testing.

## Android preview build

The owner completed Expo setup and approved this computer’s Expo CLI login on 18 October 2026. The Free plan had unused Android build quota. An isolated mobile-only source archive was inspected before upload; it contains no store database keys, staff passwords, Discord webhook, local environment files or signing credentials. Expo manages the new Android signing key privately.

Build: https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-shopping/builds/e6f54180-3929-40d8-bd0f-7e3232dbcb2b

The earlier build `605c5248` compiled but exposed a missing direct font-module dependency in Expo Doctor and is superseded. Use the corrected build linked above; Expo Doctor now passes 21/21 checks. This is an internal preview APK build, not a Play Store submission. Native device QA and the iPhone signing/distribution setup remain open.

For source uploads, use an isolated mobile-only checkout, as used for this build. Inspect `eas build:inspect --platform android --stage archive --profile preview --output <new-inspection-folder>` before upload. Keep store server source, private outputs, environment files and signing credentials outside the uploaded checkout.

## Android 1.0.1 preview — campaign refinement

The updated internal Android build (version code 2) is tracked at https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-shopping/builds/5176d8eb-7785-428b-9725-d2af267ec04c. It uses the existing signing key so it can update the earlier test app. Use its successful APK artifact for the latest design; the 1.0.0 build above is the previous release.

The photo campaigns now rotate every six seconds while visible and active. Direct page selection, swiping or touching a campaign pauses rotation until Play; navigation, app backgrounding, offscreen position, reduced motion and native screen-reader preferences also stop automatic movement. The web preview pauses on keyboard focus and hover. Department photographs, search and product shelves receive the same scoped Everyday Market refinement. TypeScript, Android/iOS bundle exports and browser motion checks passed; native phone testing is still required.

The owner chose Android first. The earlier Expo Go tunnel/QR was a temporary development session and has been stopped; it is not an iPhone installation link.
