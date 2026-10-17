# Askari customer app

Real Expo / React Native screens for Android and iPhone. The existing Next.js website, Supabase catalogue, private staff desk, owner cash controls and automatic Discord picture-PDF receipts remain the shared backend. Only the delivery-pin map is a WebView (Leaflet/OpenStreetMap); the shopping UI and navigation are native.

## Run on a phone

Requirements: Node 22.13+ and pnpm. Install Expo Go **SDK 57** on the phone; the current Expo transition guide explicitly recommends SDK 57 for physical-device Expo Go. Both devices must reach the development machine, or use Expo's tunnel option.

```sh
cd mobile
pnpm install --frozen-lockfile
pnpm start
```

Scan the displayed QR code. Android can scan in Expo Go; iPhone can scan using Camera. Set `EXPO_PUBLIC_STORE_URL` only when using another deployed Askari backend. Public checkout/config/status routes introduced by this change must be deployed before the phone app can order.

The app has guest checkout, not phone OTP authentication. Recent orders and favourites belong to this device; they do not sync to another phone. Customer receipt access expires after 90 days. Native receipt keys and opt-in saved addresses use SecureStore; the browser preview uses session storage for these private fields. An uncertain order keeps its original key and payload across restarts, preventing duplicate orders.

## Android installable test build

An Expo account and EAS project are required. No private store/backend credentials belong in this app.

```sh
cd mobile
pnpm dlx eas-cli login
pnpm dlx eas-cli init
pnpm dlx eas-cli build --platform android --profile preview
```

The preview profile produces an APK installation link. Creating the EAS project adds the owner's actual project ID to Expo config. Confirm `pk.askari.store` is available and belongs to the store before the first production release. Android production uses an AAB, uploaded through the owner's Google Play account. EAS cloud builds require the account owner's build/signing setup; an exported JS bundle is not an APK.

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
