---
name: Daily Basket (temporary customer identity)
description: Everyday Market grocery browsing with real packs, quiet teal controls and a clear nearby-delivery basket.
colors:
  navy: "#ffffff"
  action: "#087e78"
  action-hover: "#066761"
  canvas: "#ffffff"
  white: "#ffffff"
  ink: "#021c19"
  secondary: "#536460"
  metadata: "#63726d"
  line: "#d9e4e2"
  surface: "#e7f7f6"
  gold: "#087e78"
  gold-fill: "#087e78"
  success: "#207353"
  quantity-surface: "#e7f7f6"
  quantity-border: "#a4d9d2"
  discount-surface: "#087e78"
  discount-text: "#ffffff"
  mobile-light-background: "#f7f9f6"
  mobile-light-surface: "#ffffff"
  mobile-light-tint: "#087e78"
  mobile-light-on-tint: "#ffffff"
  mobile-light-text: "#11231c"
  mobile-light-muted: "#52665b"
  mobile-light-line: "#d9e4dc"
  mobile-light-soft: "#e4f3eb"
  mobile-light-error: "#a32929"
  mobile-dark-background: "#101916"
  mobile-dark-surface: "#192720"
  mobile-dark-tint: "#75d6c6"
  mobile-dark-on-tint: "#062c24"
  mobile-dark-text: "#f2f6f3"
  mobile-dark-muted: "#b3c6bd"
  mobile-dark-line: "#35483e"
  mobile-dark-soft: "#223b30"
  mobile-dark-error: "#ffb4a6"
  mobile-preview-frame: "#e5ebe7"
  mobile-campaign-background: "#073f37"
  mobile-campaign-text: "#ffffff"
  operations-teal: "#087e78"
  operations-deep: "#073f37"
  operations-ink: "#15352e"
  operations-muted: "#5e726b"
  operations-line: "#dfe8e2"
  operations-soft: "#edf4ef"
  operations-paper: "#f7f9f6"
  operations-white: "#ffffff"
  operations-focus: "#49a99a"
  operations-danger: "#923d32"
  operations-error-surface: "#fff0ec"
  operations-error-text: "#873b30"
  operations-notice-surface: "#f7edda"
  operations-notice-text: "#6e5129"
  operations-review-surface: "#f8eddb"
  operations-review-text: "#7a5728"
  operations-done-surface: "#def0e2"
  operations-done-text: "#286141"
  operations-selected-surface: "#f0f8f1"
  operations-cash-surface: "#f9f3e6"
  operations-owner-cash-surface: "#e6f0e5"
  operations-chart: "#438d70"
  operations-nav-selected: "#e4f2e9"
  operations-nav-hover: "#245c4e"
typography:
  headline: { fontFamily: "Poppins, sans-serif", fontSize: "28px", fontWeight: 600, lineHeight: 1.22, letterSpacing: "-0.035em" }
  headline-mobile: { fontFamily: "Poppins, sans-serif", fontSize: "24px", fontWeight: 700, lineHeight: 1.25 }
  body: { fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 400, lineHeight: 1.5 }
  product-title: { fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 650, lineHeight: 1.45 }
  price: { fontFamily: "Poppins, sans-serif", fontSize: "18px", fontWeight: 750, letterSpacing: "-0.025em" }
  metadata: { fontFamily: "Poppins, sans-serif", fontSize: "11px", fontWeight: 400 }
  mobile-body: { fontSize: "17px", lineHeight: 1.470588 }
  mobile-heading: { fontSize: "22px", fontWeight: 700, lineHeight: 1.318182 }
  mobile-product-title: { fontSize: "15px", fontWeight: 600, lineHeight: 1.4 }
  mobile-price: { fontSize: "18px", fontWeight: 700, lineHeight: 1.5 }
  mobile-campaign-heading: { fontSize: "24px", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.5px" }
  customer-wordmark: { fontFamily: "Poppins, sans-serif", fontSize: "25px", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.035em" }
  mobile-wordmark: { fontSize: "22px", fontWeight: 700, lineHeight: 1.227273, letterSpacing: "-0.5px" }
  mobile-tab-label: { fontSize: "12px", fontWeight: 600 }
  operations-headline: { fontFamily: "Poppins, sans-serif", fontSize: "27px", fontWeight: 600, lineHeight: 1.35, letterSpacing: "-0.025em" }
  operations-body: { fontFamily: "Poppins, sans-serif", fontSize: "13px", lineHeight: 1.6 }
  operations-action: { fontFamily: "Poppins, sans-serif", fontSize: "12px", fontWeight: 600 }
  operations-number: { fontFamily: "Poppins, sans-serif", fontSize: "29px", fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.025em" }
rounded:
  control: "7px"
  search: "10px"
  card: "14px"
  mobile-control: "14px"
  mobile-field: "12px"
  mobile-card: "16px"
  mobile-banner: "16px"
  mobile-summary: "16px"
  mobile-icon: "24px"
  operations-field: "8px"
  operations-control: "10px"
  operations-filter: "8px"
  operations-status: "5px"
  operations-queue: "13px"
  operations-panel: "14px"
  operations-detail: "16px"
spacing:
  shelf-gap: "17px"
  rail-gap: "24px"
  desktop-gutter: "56px"
  mobile-gutter: "18px"
  native-page: "20px"
  native-grid-gap: "12px"
  native-button-horizontal: "18px"
  native-button-vertical: "13px"
  operations-gutter: "32px"
  operations-phone-gutter: "16px"
  operations-workbench-gap: "22px"
  operations-button-padding: "12px 17px"
  operations-detail-padding: "26px 28px"
components:
  button-primary: { backgroundColor: "{colors.action}", textColor: "#ffffff", rounded: "{rounded.control}", height: "42px" }
  button-basket: { backgroundColor: "{colors.gold-fill}", textColor: "{colors.navy}", rounded: "{rounded.control}" }
  product-card: { backgroundColor: "{colors.white}", textColor: "{colors.ink}", rounded: "{rounded.card}" }
  basket-rail: { backgroundColor: "{colors.navy}", textColor: "{colors.white}", rounded: "{rounded.card}", padding: "23px 21px 21px" }
  quantity: { backgroundColor: "{colors.quantity-surface}", textColor: "{colors.action}", rounded: "{rounded.control}", height: "39px" }
  mobile-button-light: { backgroundColor: "{colors.mobile-light-tint}", textColor: "{colors.mobile-light-on-tint}", rounded: "{rounded.mobile-control}", padding: "13px 18px" }
  mobile-button-dark: { backgroundColor: "{colors.mobile-dark-tint}", textColor: "{colors.mobile-dark-on-tint}", rounded: "{rounded.mobile-control}", padding: "13px 18px" }
  mobile-product-card-light: { backgroundColor: "{colors.mobile-light-surface}", textColor: "{colors.mobile-light-text}", rounded: "{rounded.mobile-card}", padding: "12px" }
  mobile-product-card-dark: { backgroundColor: "{colors.mobile-dark-surface}", textColor: "{colors.mobile-dark-text}", rounded: "{rounded.mobile-card}", padding: "12px" }
  mobile-campaign: { backgroundColor: "{colors.mobile-campaign-background}", textColor: "{colors.mobile-campaign-text}", typography: "{typography.mobile-campaign-heading}", rounded: "{rounded.mobile-banner}" }
  customer-mark: { width: "54px", height: "54px" }
  mobile-customer-mark-light: { width: "48px", height: "48px" }
  mobile-customer-mark-dark: { width: "48px", height: "48px" }
  operations-button-primary: { backgroundColor: "{colors.operations-teal}", textColor: "{colors.operations-white}", rounded: "{rounded.operations-control}", padding: "12px 17px" }
  operations-button-secondary: { backgroundColor: "{colors.operations-soft}", textColor: "{colors.operations-deep}", rounded: "{rounded.operations-control}", padding: "12px 17px" }
  operations-order-detail: { backgroundColor: "{colors.operations-white}", textColor: "{colors.operations-ink}", rounded: "{rounded.operations-detail}", padding: "26px 28px" }
  operations-field: { backgroundColor: "{colors.operations-white}", textColor: "{colors.operations-ink}", rounded: "{rounded.operations-field}", padding: "10px 12px" }
  operations-status-review: { backgroundColor: "{colors.operations-review-surface}", textColor: "{colors.operations-review-text}", rounded: "{rounded.operations-status}", padding: "4px 7px" }
---

# Design System: Daily Basket (temporary customer identity)

## Overview

**Creative North Star: "Everyday Market"**

Daily Basket is a temporary customer identity: an original dimensional 3D teal basket mark beside a readable wordmark. The user clarified that Askari supplies inventory and revoked its customer-facing name/logo. The mark was generated without a supplier image or logo reference. No supplier logo ships; future work must follow the customer identity shown in `components/StoreLogo.tsx` and `mobile/src/ui.tsx`. The final name is pending.

The established website uses white shelves, pale aqua fields, teal controls and Poppins typography. The approved Everyday Market native refinement carries the same grocery clarity through compact system typography, photographic browsing and exact pack identity. Native tokens use `mobile-` names and `native-` spacing; unrelated incumbent web tokens retain their scope. The preview frame belongs only to the labelled browser wrapper. The approved operations extension uses deliberately light work surfaces, deep teal navigation and role-focused actions. Its tokens use operations- names and do not replace the web or native scopes.

**Key Characteristics:**
- Real pack photographs and visible pack sizes.
- Teal actions, quiet bordered surfaces and explicit stock states.
- A compact basket wordmark without supplier branding.
- Native system typography and readable light/dark role colors.
- Clear quantity, delivery-progress and server-confirmed order feedback.

## Colors

White owns website shelves; teal owns actions, focus and selected departments. Pale aqua groups search, delivery and basket regions. Dark green-black text and gray-green support text preserve readable hierarchy. Success accompanies explicit stock labels.

Native system/light/dark preferences select the role colors in `mobile/src/theme.tsx`: background, surface, tint, on-tint, text, muted, line, soft and error. Dark mode uses green-black surfaces with a lighter teal action and dark on-tint text. Exact pack photos retain white image surfaces in both modes. The original raster basket mark retains its teal/mint artwork in either native appearance and on the website. `/app-preview` and `/app-privacy` use their explicitly scoped extension roles.

Native photographic campaigns use the scoped campaign background and text roles in both appearances. A solid deep teal text panel preserves readable white copy beside the still-life photograph; it does not replace the app's adaptive surface or action roles.

**The Real Shelf Rule.** Display imported selling prices and actual stock. No invented markup, discount, rating or availability may be added to customer screens.

Operations primary roles map directly from the scoped --ops-* properties in app/operations.css; additional operations state colors are extracted literals used by the same components. Deep teal anchors navigation; warm green-white paper and white detail panels hold the work. Amber review/cash tones and green completion tones accompany explicit words. The apps hub shares this light operational world. Team reuses native light/dark roles and follows the system setting.

**The Separate State Rule.** Delivery and returned cash must have separate labels and actions; color alone cannot communicate either state.

## Typography

The website uses self-hosted Poppins from the official Google Fonts distributions; its existing font licensing and source references remain authoritative. Preserve incumbent website typography outside the new customer wordmark. The wordmark uses the `customer-wordmark` role, stepping down to 21 CSS pixels on phones and 19 in the desktop staff header (17 in its phone layout).

Native text leaves `fontFamily` unset and uses the platform system font. The native body, heading, product-title, price, wordmark and tab roles are in the frontmatter; React Native uses numeric logical units while this portable spec expresses dimensions as pixel strings. Shelf titles use two lines with full names available on product detail and through accessibility labels. English/Urdu changes text, alignment and writing direction without claiming complete layout mirroring. System font scaling stays enabled; enlarged-text layout requires native QA.

**The Familiar Name Rule.** Keep real package names, brands and variants in ordinary case; package photography carries their own lettering.

## Layout

Preserve the website's department/catalog/basket structure and two-column phone shelves. Find a brand filtering is removed; product brand labels remain. The established header has a pale aqua announcement, white navigation, teal delivery selection and pale aqua search. The mobile grocery-list invitation uses one readable column with its title, description and action on separate rows; desktop retains the existing strip.

Native pages use the frontmatter page padding and grid gap. Measured content selects one column below 360 logical units, two below 700, three below 1000 and four thereafter. Five bottom tabs expose Shop, Categories, Basket, My orders and Help; Android windows at least 768 wide use a left rail. Search, lists, preferences, catalog, product, checkout and receipt details use a native stack; delivery-pin selection is modal. The compact home opening contains the customer mark, saved action, delivery locality and search, followed by a swipeable photo banner and horizontal department row. Language and appearance live in Help > Preferences. Basket access remains visible through the dock and tab badge.

Safe-area handling, iOS checkout keyboard avoidance and hiding tabs while typing are implemented. Native Back, gestures and safe areas need device verification. The `/app-preview` iframe is limited to 460 CSS pixels and visibly labelled as a browser preview; screenshots establish browser layout only.

Operations use a 238 CSS-pixel sidebar and an up-to-1800-wide content region with a queue/detail workbench. At 1200 the sidebar narrows; at 1000 it becomes a horizontal header; at 720 the queue and selected detail become mutually exclusive views with Back to queue. Phone content uses the operations phone gutter. Owner overview changes from chart/cash columns to a stack and preserves exact figures in a table. The apps hub is capped at 1060 and changes from two download columns to one at 620. Team uses one job list and stack detail, 20 logical-unit page padding and bottom safe-area allowance.

## Elevation & Depth

Website cards retain thin borders at rest and the incumbent soft hover shadow. Basket and informational regions use pale aqua; existing bounded basket and overlay animations retain immediate reduced-motion feedback.

Native cards use flat role-based borders and tonal layering without a shared shadow token. Pressed primary buttons reduce opacity, while icon actions use the soft surface. Stack animation is iOS default or Android fade-from-bottom; the OS reduced-motion preference disables stack animation. The basket dock uses a brief 180 ms scale confirmation when quantities change and reduced motion is off. This does not claim every native modal transition is disabled.

Operational work surfaces are flat: one-pixel dividers and tonal containers provide depth, with no decorative shadow. The original brand raster contains its own satin shading and bevels; this is confined to the mark. Operation buttons transition background/opacity over 160 ms ease-out; reduced motion disables these transitions and refresh spinning.

**The Shelf Border Rule.** Use borders and tonal surfaces to separate grocery information; keep product photography clear of decorative depth.

## Shapes

Preserve unrelated incumbent website corner tokens. The basket mark source is the original transparent 3D raster, replacing the generic Lucide/basket-outline identity. The final website override uses a transparent, unrounded 54 CSS-pixel frame, 48 on phones; operations navigation may further size the frame. Customer native headers use a contained 48-unit mark and Team headers 50. The raster supplies its own dimensional material; do not add a surrounding tile or invent a vector approximation.

Native controls use 14-unit corners, fields 12, shelf cards and photo banners 16, and basket/summary containers 16. Other existing receipt/history panels keep their incumbent shapes. Circular icon actions are 48 square with radius 24. Primary buttons have minimum height 52; quantity-stepper targets are 48 wide and at least 50 high. Department photographs use rounded-square crops inside a thin bordered frame; contained pack photographs preserve exact package identity. The website's round department imagery retains its existing shape.

Operations keep compact semantic shapes: fields and filters, standard actions, queue cards, owner panels and selected detail have distinct frontmatter radii. Small 3px chart tops and 9/11px local selectors are source details, not a new universal radius scale. Team inherits native 14-unit buttons and 16-unit job cards with large touch targets.

## Components

Stock and pending prices are explicit. Loading, empty, unavailable, retry and confirmed-order/local-save-warning states remain distinct. Disabled/busy controls expose accessibility state; errors use text alerts. Product photos have an explicit fallback.

Native campaigns use a full photograph with a solid text panel occupying 60% of the slide, the campaign-heading role and a short linked catalogue action. Three campaigns advance every six seconds while visible, focused and active. Swipes, touches and direct page choices pause movement until Play; 48-unit pagination and pause/play targets retain manual control. Autoplay also stops for reduced motion and native screen readers, and browser hover or keyboard focus. React Native Web's screen-reader query is a constant stub, so the browser preview relies on its reduced-motion and interaction guards; native accessibility behaviour still needs device verification. The carousel does not introduce a shared transition duration.

Native shelf cards keep brand, two-line pack name, pack size and teal price in a consistent order. The favourite action sits on its own surface above the white pack-photo region. Home search and the saved-products header action use the adaptive soft surface.

Native Add becomes a quantity stepper and updates the Basket badge, capped visually at 99+. The dock opens the basket and shows product subtotal; delivery progress uses the real configured threshold. Pending attempts lock basket mutations and delivery fields. Lists are local named checklists, with separate actions for adding current available linked products, sending unchecked text to the store and sharing the list. Basket/product saves record product links; plain written entries are never silently treated as catalog matches. Repeat and recently viewed shelves refresh availability. Product detail offers related current products and an enlarged pack-photo modal.

Order steps follow server statuses, with refresh and private receipt-PDF sharing from saved snapshots. The existing picture-PDF renderer embeds Noto Sans/Noto Sans Arabic, paginates at A5 and uses authoritative saved photos/totals. New orders are visible to manager and picker together immediately, with no incoming order/bill approval. Exact-pack completion and an assigned active rider gate dispatch. The rider reports Delivered; only then does the manager or owner verify customer delivery and exact physically returned cash to close payment. Delivered is separate from cash_confirmed. No live rider position or online-payment state is implied.

Website full photographic campaigns and round department images retain their existing provenance in `public/images/README.md`; catalog sources remain in `work/image-sources.json`. The 21 October identity update introduces the original 3D basket and matching launcher raster. Exact prompts and derivative provenance live beside public/brand/*.png and mobile/assets/*.png in .png.json files and embedded metadata; mobile/assets/README.md records lineage. No supplier artwork was supplied to generation. Native icon mappings use SF Symbols on iOS and Material Community icons on Android where mapped, with Ionicons fallback. Sidecar native snippets are illustrative browser translations, not native-runtime evidence.

Operational primary actions use teal/white, secondary actions use soft/deep, and destructive actions use the scoped danger role. Their 46 CSS-pixel minimum height, explicit disabled state and 3px focus outline support desk work; inline fields have a 44-pixel minimum height. Queue entries combine customer, explicit stage, exact pack previews and total. Selected detail exposes address, item quantities, authoritative bill and the permitted next action. The cash form appears only after reported Delivered status and requires the exact physically received amount plus an explicit delivery-and-full-cash attestation. Owner cost/expense forms keep unknown costs visible. Team shares native Button/Field/Notice components; job cards and exact-pack checks use native role colors, not the web operation palette.

Owner Account security reuses the operations section heading, quiet divider, labelled password form, teal primary action and text status/error patterns. Its recovery-email row wraps the long address rather than shrinking or clipping it. Password fields retain explicit current/new/confirmation labels and appropriate autocomplete. The recovery page inherits the two-panel owner login composition and stacks on phones. Checking, unconfigured, request, accepted-send, reset, success and error states have distinct text; browser previews cannot establish an actual email delivery. Each Team access row exposes separate Edit access and Change password text actions. The password-only form keeps explicit new/confirmation labels and reports success using the existing tonal status surface. Preview fixtures are clearly fictional; controls can be opened for review, while save remains disabled. These are component extensions within the existing operations palette, type and shape scopes.

Owner Business overview adds an initially closed **Reset test earnings** disclosure above its totals. The plain summary opens a count/sales review, an explicit test-order checkbox and the existing primary/secondary actions; the preview cannot submit. Counts use tabular figures, explanatory copy wraps and actions flow onto additional rows on phones. Success/error text and **Undo last reset** use the existing operational status and action patterns. This is an ordinary extension of the scoped operations system, with no new palette, type, shape or motion tokens. Its copy distinguishes report exclusions from retained receipts/history/staff jobs and unchanged operating expenses. Delivery selection pairs an exact distance and explicit eligibility text with the visible configured 7 km circle. Native/browser wrappers load the public /delivery-map HTML route, whose server-configured map fits the circle's bounds and supplies visible OpenStreetMap tiles; app validation uses config.radius_km. The final rule is straight-line distance from the original store pin, 14 km across; the briefly considered road-routing rule was superseded. The operations/mobile surface briefs carry implementation and evidence limits.

The apps hub retains its existing two role/download slots. A finished, download-verified build exposes its download; each pending slot uses explicit queue text and the exact build-status link. Team directs staff to the web Packing desk while its replacement builds. These are existing layout/status patterns and introduce no new visual-system tokens.

## Do's and Don'ts

### Do:
- **Do** use Daily Basket as a temporary customer wordmark with the original 3D teal basket artwork until the final name is confirmed.
- **Do** preserve exact pack photography, real brand/variant labels, imported prices and explicit stock states.
- **Do** scope native light/dark roles to the app and its identified preview/privacy wrappers.
- **Do** keep guest checkout, current-stock list/reorder checks and server-confirmed totals clear.
- **Do** retain supplier provenance, real contacts, 7 km straight-line PGECHS dispatch coverage from the original store pin, COD rules, compatible storage namespaces and authenticated staff tools.

### Don't:
- **Don't** restore Askari's name or supplier-logo artwork as the customer-facing identity.
- **Don't** import reference-store names, logos, promotions or unrelated departments.
- **Don't** invent selling prices, discounts, rewards, live tracking or payment confirmation.
- **Don't** present browser captures or JavaScript exports as native-device QA, signed installations or app-store publication.
- **Don't** treat the temporary name as final before store publication; preserve the already authorized signing identifiers and compatibility namespaces.
