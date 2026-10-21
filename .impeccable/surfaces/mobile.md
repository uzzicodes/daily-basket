---
version: 1
slug: mobile
primary_target: mobile/App.tsx
related_targets: [mobile/src]
---
# Daily Basket customer app (temporary identity)
Mode: Operate. Platform: adaptive native (Android and iPhone). Phone first.

## Direction contract — Everyday Market upgrade
THESIS: The user selected Everyday Market from three real-content layout previews on 18 October 2026. Make Daily Basket feel like a complete, familiar grocery app, retaining the established teal system and real store operations. The user confirmed Daily Basket as a temporary working name on 18 October 2026; Askari is the inventory source, not the customer brand.

OWN-WORLD: White and green-white surfaces, precise dark-green system typography, teal controls, 16-unit shelf cards, exact pack photography and full photographic department banners. Large touch targets and intentional spacing replace oversized empty cards and repeated full-width buttons.

STORY: Find a familiar item, inspect the exact pack, add it, see the basket, choose a nearby address and pay on delivery. Saved lists, searches and recently viewed products make the next visit easier. Status and receipts reflect the server.

FIRST VIEWPORT: Compact basket-wordmark/saved header; language and appearance in Preferences, readable delivery locality, prominent search, a swipeable photo banner, a compact horizontal department row and the beginning of available products. Basket access stays above the native navigation when needed.

FORM: User-selected refinement of the established native shopping surface. Local additions inherit its visual world; no replacement identity or direction roll. Alternatives were Weekly Shop and Quick Aisle. Source references: Al-Fatah/Naheed photo browsing and Instacart repeat-shopping patterns, translated to the connected catalogue’s nine departments and local stock.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

SCOPE: App-wide refinement; recent searches, recently viewed and repeat-product shelves, persistent shopping checklists, appearance preference, useful related products, visible basket and delivery progress, order timeline and customer PDF sharing. Loyalty, online payment and live rider tracking require actual integrations and are not represented as connected features. Native release remains separate from browser-preview QA and bundle validation.

The user approved conversion to a shopping app after explicitly explaining that their regular customers prefer apps to websites. Use the confirmed temporary Daily Basket basket mark and wordmark; inherit the established white/teal system, grocery photographs, nine departments, 5 km dispatch radius, COD fees and manager-or-owner settlement. Adapt the established shopping flows to native navigation and touch controls; no new visual-world selection is needed.

FIRST VIEWPORT: Safe-area brand/delivery header, a large search field, a photographic grocery banner, round department photos, available products. A native tab bar exposes Shop, Categories, Basket, My Orders and Help. Product and checkout details use native stack navigation and system Back. Larger semantic type, 48 dp actions, English/Urdu controls, light/dark roles, and no mandatory account before ordering.

SIGNATURE: Add becomes a quantity stepper and updates the native Basket badge. Reorder refreshes exact product identities and current availability. Saved address is opt-in and secure on native devices. Uncertain checkout retries reuse the frozen idempotency key and original payload; they must not create duplicate orders.

QUALITY BAR: Simple enough for a customer to choose a familiar pack and order without learning a desktop-style interface. No fake discounts, availability, login, delivery statuses or payment controls. Product photographs and saved server totals remain authoritative. App-store publication and actual native-device verification require account/device access; web preview is labelled as such and is never passed off as native test evidence.

DOCUMENTED IMPLEMENTATION (18 October 2026): Expo SDK 57 / React Native, guest ordering without OTP, English/Urdu text and alignment, system/light/dark appearance preferences, SF Symbols on iOS and Material Community icons on Android with Ionicons fallbacks. Bottom tabs become a left rail on Android at 768 logical units. System type scaling is enabled; text direction does not imply full layout mirroring. Native tokens extend root DESIGN.md with `mobile-` names; existing web tokens retain their scope.

DATA AND OPERATIONS: Native SecureStore holds optional remembered addresses, private receipt keys and pending customer details. Browser-preview private fields use session storage. Basket/favourites/language/appearance/lists/searches/viewed items/recent order summaries are device-local; there is no cross-phone account history or customer push. Reorder refreshes stock and prices. Shared 5 km coverage, COD fees, stock enforcement, manager-or-owner settlement and private staff Discord PDF receipts remain authoritative. Uncertain checkout retries retain the frozen payload/key; explicit stock/price rejection releases it for basket review. Confirmed orders are not reported as failed when local history storage fails.

FINISH EVIDENCE: Reviewer verdict **ship at code/browser-preview scope only** after both material retry fixes were resolved. TypeScript and Android/iOS JavaScript exports passed. `.impeccable/review/mobile/browser-{home,categories,product,basket,urdu}.png` are browser captures, not native screenshots. The one-off web-wrapper detector advisories `#e5ebe7`, `#11231c` and `#f7f9f6` are documented preview/native extension colours. Native permissions, platform symbols, Android Back/iOS gestures, safe areas, enlarged text and performance require device/simulator QA. At that historical review, signing/account setup and binary distribution were still open. Current signed-build state is recorded below; store publication and device QA remain separate.

## Customer brand update — 18 October 2026
User clarified Askari is the inventory source, not the customer brand. Use Daily Basket as a temporary working name with an original 3D teal basket mark. Preserve supplier provenance, catalogue names, contacts, pricing, internal storage namespaces and current deployment URL. Final name remains pending.

EVERYDAY MARKET EVIDENCE: Browser preview captures at 390 × 844 and storefront captures at 390 × 844 / 1440 × 1000 are in `.impeccable/review/market/`. First review requested the mobile website list-strip placement and stale supplier-identity documentation; both are corrected for the verdict pass. No native screenshot is available. Android/iOS JS exports and mobile TypeScript passed; that review did not establish an installable binary. Existing WebP artwork exact prompts are retained in README and sidecars; provenance scan reports 15 rasters, zero missing.

## Banner and shelf polish — 18 October 2026

SCOPE: Narrow refinement of Everyday Market for the user's Android-first shopping audience. Preserve the temporary Daily Basket identity, teal actions, system typography, catalogue truth and existing artwork provenance. Native campaigns now place readable white copy on a solid deep teal panel beside the existing still-life photograph. Department photos use compact rounded-square frames; shelf cards align brand, pack name, size and teal price, with a separate favourite surface. Home search uses the existing soft role.

MOTION: Three campaigns advance every six seconds while visible, navigation-focused and active. Touch, swipe or a direct page choice pauses until Play. Pagination and pause/play have 48-unit targets. Reduced motion and native screen-reader state prevent autoplay; browser hover and keyboard focus also pause it. React Native Web's screen-reader query is a constant stub, so the browser relies on reduced-motion and interaction guards. This behaviour is scoped to the carousel rather than a new global motion language.

FINISH EVIDENCE: `.impeccable/review/banner-polish/reviewer.md` records **ship at source/browser-preview scope only**. Five validated captures are `phone-home.png`, `phone-products.png`, `phone-categories.png`, `phone-urdu-dark.png` and `desktop-preview.png` in that folder. Source and supplied browser runtime evidence support automatic movement and manual/offscreen pause. No native detector ran, and the unchanged web-wrapper CSS was outside detector scope. Device installation, native accessibility, enlarged text, system bars, Back/gestures and performance remain unverified. Metadata at that review was version 1.0.1 / Android versionCode 2; the current signed release state follows.

## Original brand and role handoff — 21 October 2026

IDENTITY: The temporary Daily Basket name stays; the flat generic icon is replaced by an independently generated 3D teal/mint basket with a cream parcel and green leaves. No supplier image/logo was referenced; no supplier logo ships. Website sources are public/brand/daily-basket-mark-v2.png, daily-basket-app-icon-v2.png and the optimized daily-basket-mark-192.png. Customer/Team headers use mobile/assets/brand-mark-144.png; the launcher uses app-icon-1024-v2.png. Exact generation prompts and resized-derivative lineage live in adjacent .png.json sidecars and embedded PNG metadata; mobile/assets/README.md explains the masters. Actual product brand names and catalogue photography remain factual.

AUTHORITY: Delivered records actual customer delivery. A separate cash_confirmed flag records exact cash physically handed to the manager or owner. Packers/riders cannot settle cash; do not restore earlier owner-only settlement copy. Owner purchase/delivery costs, expenses and financial reporting remain private. The customer shopping experience remains guest ordering with the same authoritative backend and compatible storage names.

DISTRIBUTION: Current customer metadata is 1.0.2 / Android code 3; signed EAS build 266afa8a-853a-4fad-9862-f809fcd0d4c7 is finished. The verified customer APK is maintained in lib/app-downloads.ts and /apps. Team is a separate Android app (1.0.0 / code 1), with account-selected packer/rider views; its signed build 19ecf595-9678-4bad-9064-b58d1385d6a7 is finished. Both APKs were downloaded and passed ZIP/signing-block structural checks. Verified URLs are in lib/app-downloads.ts; final /apps desktop/phone captures show both downloads. docs/OPERATIONS.md records the handoff. Manager/owner workspaces use /manage and /owner on the web; /admin compatibility remains. Legacy hosting slug stays because the metadata tool cannot rename it; public UI/title is Daily Basket.

EVIDENCE: .impeccable/review/customer-web-phone.png is a customer browser capture. Team browser captures are team-packer-web-phone.png, team-packer-actions-web-phone.png, team-rider-web-phone.png and team-rider-actions-web-phone.png in the same directory. All are web previews; there is no Android SDK/device/emulator QA. Signed builds do not establish native UX. Native system bars/insets, enlarged text, Back/gestures, platform symbols, native light/dark appearance, permissions, sharing and performance require installation testing. The signed app handoff is complete; the final reviewer verdict remains separate. Team foreground jobs refresh every 10 seconds and on resume; no native background push is configured, and the app tells staff to keep it open.

OWNER RECOVERY: Owner account security and /owner/recover are web surfaces, including on phones. Recovery is email-only to uzair.business.2003@gmail.com; phone recovery is disabled. Staff Team credentials and guest shopping remain separate. Signed-in owner password change requires the current password, retains the current browser session and signs out older owner sessions; recovery uses a 15-minute single-use fragment link. The user deferred Resend/email setup until later. No sender key is saved and no email was sent; email recovery requests remain pending/disabled until the user resumes setup. Phone recovery stays disabled. See operations.md for source/security evidence.

STAFF PASSWORDS: The owner can reset every created manager/packer/rider password through Team access on the web, including in a phone browser. A dedicated per-row action requires confirmation, preserves role/access and revokes the person's older sessions; Team then requires the new password. This does not create customer accounts or staff self-service recovery. Owner preview staff are clearly fictional and cannot be saved.
