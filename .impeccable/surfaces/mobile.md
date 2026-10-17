---
version: 1
slug: mobile
primary_target: mobile/App.tsx
related_targets: [mobile/src]
---
# Askari customer app
Mode: Operate. Platform: adaptive native (Android and iPhone). Phone first.

The user approved conversion to a shopping app after explicitly explaining that their regular customers prefer apps to websites. Inherit Askari's supplied logo, white/teal identity, full grocery photographs, nine departments, 5 km store radius, COD fees and owner-only settlement. Adapt the established shopping flows to native navigation and touch controls; no new visual-world selection is needed.

FIRST VIEWPORT: Safe-area brand/delivery header, a large search field, a photographic grocery banner, round department photos, available products. A native tab bar exposes Shop, Categories, Basket, My Orders and Help. Product and checkout details use native stack navigation and system Back. Larger semantic type, 48 dp actions, English/Urdu controls, light/dark roles, and no mandatory account before ordering.

SIGNATURE: Add becomes a quantity stepper and updates the native Basket badge. Reorder refreshes exact product identities and current availability. Saved address is opt-in and secure on native devices. Uncertain checkout retries reuse the frozen idempotency key and original payload; they must not create duplicate orders.

QUALITY BAR: Simple enough for a customer to choose a familiar pack and order without learning a desktop-style interface. No fake discounts, availability, login, delivery statuses or payment controls. Product photographs and saved server totals remain authoritative. App-store publication and actual native-device verification require account/device access; web preview is labelled as such and is never passed off as native test evidence.

DOCUMENTED IMPLEMENTATION (18 October 2026): Expo SDK 57 / React Native, guest ordering without OTP, English/Urdu text and alignment, OS-driven light/dark roles, SF Symbols on iOS and Material Community icons on Android with Ionicons fallbacks. Bottom tabs become a left rail on Android at 768 logical units. System type scaling is enabled; text direction does not imply full layout mirroring. Native tokens extend root DESIGN.md with `mobile-` names; existing web tokens retain their scope.

DATA AND OPERATIONS: Native SecureStore holds optional remembered addresses, private receipt keys and pending customer details. Browser-preview private fields use session storage. Basket/favourites/language/recent summaries are device-local; there is no cross-phone account history or customer push. Reorder refreshes stock and prices. Shared 5 km coverage, COD fees, stock enforcement, owner-only settlement and private staff Discord PDF receipts remain authoritative. Uncertain checkout retries retain the frozen payload/key; explicit stock/price rejection releases it for basket review. Confirmed orders are not reported as failed when local history storage fails.

FINISH EVIDENCE: Reviewer verdict **ship at code/browser-preview scope only** after both material retry fixes were resolved. TypeScript and Android/iOS JavaScript exports passed. `.impeccable/review/mobile/browser-{home,categories,product,basket,urdu}.png` are browser captures, not native screenshots. The one-off web-wrapper detector advisories `#e5ebe7`, `#11231c` and `#f7f9f6` are documented preview/native extension colours. Native permissions, platform symbols, Android Back/iOS gestures, safe areas, enlarged text and performance require device/simulator QA. Signing, account setup, APK/AAB/IPA builds and store publication are unavailable and remain release gates.
