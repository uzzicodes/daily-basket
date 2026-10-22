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

## Historical Android preview build

The owner completed Expo setup and approved this computer’s Expo CLI login on 18 October 2026. The Free plan had unused Android build quota. An isolated mobile-only source archive was inspected before upload; it contains no store database keys, staff passwords, Discord webhook, local environment files or signing credentials. Expo manages the new Android signing key privately.

Build: https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-shopping/builds/e6f54180-3929-40d8-bd0f-7e3232dbcb2b

The earlier build `605c5248` compiled but exposed a missing direct font-module dependency in Expo Doctor and is superseded. This corrected build is historical; Expo Doctor now passes 21/21 checks. This is an internal preview APK build, not a Play Store submission. Native device QA and the iPhone signing/distribution setup remain open.

For source uploads, use an isolated mobile-only checkout, as used for this build. Inspect `eas build:inspect --platform android --stage archive --profile preview --output <new-inspection-folder>` before upload. Keep store server source, private outputs, environment files and signing credentials outside the uploaded checkout.

## Historical Android 1.0.1 preview — campaign refinement

The updated internal Android build (version code 2) is tracked at https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-shopping/builds/5176d8eb-7785-428b-9725-d2af267ec04c. It uses the existing signing key so it can update the earlier test app. Both 1.0.1 and the 1.0.0 build above are historical artifacts; current evidence is below.

The photo campaigns now rotate every six seconds while visible and active. Direct page selection, swiping or touching a campaign pauses rotation until Play; navigation, app backgrounding, offscreen position, reduced motion and native screen-reader preferences also stop automatic movement. The web preview pauses on keyboard focus and hover. Department photographs, search and product shelves receive the same scoped Everyday Market refinement. TypeScript, Android/iOS bundle exports and browser motion checks passed; native phone testing is still required.

The owner chose Android first. The earlier Expo Go tunnel/QR was a temporary development session and has been stopped; it is not an iPhone installation link.

## Current Team workflow and release checkpoint — 22 October 2026

New orders reach manager and packer immediately with no incoming order/bill approval. The packer checks every exact product and quantity and presses **Packed** directly. There is no Start packing, rider assignment or dispatch action for the packer. Packed unassigned orders automatically appear to riders. **Pick up order** atomically claims and dispatches an order; competing pickups cannot both succeed. Only the assigned rider presses **Delivered** after actual customer delivery. The manager uses **Item unavailable** or **Cancel order** with a reason before dispatch; item-unavailable cancels the whole order without changing global stock or other orders. **Payment received from rider** requires Delivered, explicit `delivery_verified=true` and physically returned cash exactly equal to the bill. Short/extra cash leaves payment open. Delivery and `cash_confirmed` remain separate. Owner overrides remain internal administration controls. Packers/riders cannot cancel or settle; packers cannot claim or deliver.

All three real staff accounts are active with valid salted hashes. The earlier user-supplied password matched none; no real staff passwords changed. Failed staff sign-ins now use separate counters per normalized username and credential version, plus a 40-attempt per-IP network cap. Success clears the account counter. Owner staff-password reset creates a new credential version, unlocks that credential and revokes older sessions. Team has Show password. Owner Team access requires confirmation whenever supplying a new password, including creation/reset.

Temporary packer, rider and manager accounts verified owner create/reset, old-password rejection, old-session revocation, new-password acceptance, preserved role and revocation on disable. Cleanup is complete; no customer orders changed. Preview identities are fictional and cannot save.

Owner Account security separately requires current password and a confirmed replacement of at least twelve characters, retains this browser through a replacement session and revokes older sessions. Email-only recovery uses a fifteen-minute single-use fragment token stored as a hash; phone recovery is disabled. Resend/email setup remains deferred: no sender key saved or recovery email sent; requests remain disabled until setup/live-send verification. No real owner password changed.

Customer 1.0.4/code 5 is unchanged. [Build 1c36143e-b496-4da4-ba18-c7a37bfe25b1](https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-shopping/builds/1c36143e-b496-4da4-ba18-c7a37bfe25b1) is FINISHED; downloaded APK checks cover ZIP CRC, manifest, DEX and signing-block presence, not cryptographic signature validation or installed-device behavior.

Team source is 1.0.3/code 4. [Build 776e6432-bd55-4d08-a3cb-15344ca21090](https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-team/builds/776e6432-bd55-4d08-a3cb-15344ca21090) is FINISHED. The downloaded `outputs/daily-basket-team-1.0.3.apk` is 81,544,917 bytes and passed ZIP CRC, AndroidManifest, DEX and APK signing-block presence checks. Its SHA-256 is `4a5bcb1604797741c27116f83c937b7a4b7ace79c330130a697f30ab45418c95`. These checks do not establish cryptographic signature validation or installed-device behavior. EAS source upload/fingerprinting succeeded. The APK source upload predates only the subsequent Team browser checkbox ARIA/neutral-label amendment; native behavior is unchanged, but this APK is not claimed to match the exact current source tree. No source commit is claimed for this APK. Local staging commit `fd8d20b` was created after submission and is only a local record. Finished [Team 1.0.2/code 3 build d21fc79a-b915-4bd2-88c0-004fc9f3295e](https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-team/builds/d21fc79a-b915-4bd2-88c0-004fc9f3295e) is historical and contains the prior assignment/dispatch workflow.

Parent reports 75/75 tests and passing root/mobile TypeScript. Hosted PostgREST rider queries passed active/completed/all/cash views, cursors and scope enforcement. The local `20261021225925_packed_orders_automatic_rider_pickup.sql` migration is applied and recorded in hosted history as version `20261021233048`, name `packed_orders_automatic_rider_pickup`. A hosted rollback-only synthetic Packed → atomic rider pickup → Delivered → manager exact-cash test passed, including second-rider claim denial, payment-before-delivery denial and four audit actions. The transaction rolled back; no real customer orders changed. Function ACL checks deny anon/authenticated and permit service authority. Security advisors report INFO private-RLS/no-policy notices on eighteen deliberately server-only private tables.

Capture tooling recovered after the earlier os error 3 failures; all twelve current captures are valid. The earlier `pickup-reviewer.md` recapture report is historical. A fresh review requested only the Team browser exact-pack checkbox ARIA checked state and neutral action label. That web-only amendment is implemented with a Platform.OS==='web' mapping; native accessibilityState and labels are unchanged. Team browser preview was re-exported and mobile TypeScript passed. Provenance scan checked one raster with zero missing records; the three-file public secret scan was clean. The final .impeccable/review/pickup-verdict.md disposition is ship for the sole scored fix at source/browser-preview scope. The reviewer checked corrected source and checked/unchecked captures; the parent-provided DOM cycle verified false → true → false, and the final snapshot exposed both checks as checked. Website publication and deployed smoke checks are outside that verdict. Existing `three-*.png` images still show the previous workflow. Native installed-device QA remains open: verify dark appearance, enlarged text, keyboard, safe areas, Back and role denial.

Publication is pending in this source snapshot. Version 23 at commit `64cf021…` was the prior 23:29 UTC checkpoint, not a claim about every later live state. The parent will build the updated browser preview, push/save source, deploy and record the final deployment receipt in `outputs/pickup-release-receipt.json`. Read that receipt for the final live version and post-deployment evidence. Do not claim completed publication from this checkpoint.
