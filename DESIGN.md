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
  mobile-price: { fontSize: "18px", fontWeight: 800, lineHeight: 1.5 }
  customer-wordmark: { fontFamily: "Poppins, sans-serif", fontSize: "25px", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.035em" }
  mobile-wordmark: { fontSize: "22px", fontWeight: 800, lineHeight: 1.227273, letterSpacing: "-0.6px" }
  mobile-tab-label: { fontSize: "12px", fontWeight: 600 }
rounded:
  control: "7px"
  search: "10px"
  card: "14px"
  mobile-control: "14px"
  mobile-field: "12px"
  mobile-card: "16px"
  mobile-banner: "16px"
  customer-mark: "12px"
  mobile-summary: "16px"
  mobile-icon: "24px"
spacing:
  shelf-gap: "17px"
  rail-gap: "24px"
  desktop-gutter: "56px"
  mobile-gutter: "18px"
  native-page: "20px"
  native-grid-gap: "12px"
  native-button-horizontal: "18px"
  native-button-vertical: "13px"
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
  customer-mark: { backgroundColor: "{colors.action}", textColor: "{colors.white}", rounded: "{rounded.customer-mark}", width: "48px", height: "48px" }
  mobile-customer-mark-light: { backgroundColor: "{colors.mobile-light-tint}", textColor: "{colors.mobile-light-on-tint}", rounded: "{rounded.customer-mark}", width: "42px", height: "42px" }
  mobile-customer-mark-dark: { backgroundColor: "{colors.mobile-dark-tint}", textColor: "{colors.mobile-dark-on-tint}", rounded: "{rounded.customer-mark}", width: "42px", height: "42px" }
---

# Design System: Daily Basket (temporary customer identity)

## Overview

**Creative North Star: "Everyday Market"**

Daily Basket is a temporary customer identity: a simple teal basket icon beside a readable wordmark. The user clarified that Askari supplies inventory and revoked its customer-facing name/logo. Historical supplier artwork remains source provenance; future work must follow the customer identity shown in `components/StoreLogo.tsx` and `mobile/src/ui.tsx`. The final name is pending.

The established website uses white shelves, pale aqua fields, teal controls and Poppins typography. The approved Everyday Market native refinement carries the same grocery clarity through compact system typography, photographic browsing and exact pack identity. Native tokens use `mobile-` names and `native-` spacing; unrelated incumbent web tokens retain their scope. The preview frame belongs only to the labelled browser wrapper.

**Key Characteristics:**
- Real pack photographs and visible pack sizes.
- Teal actions, quiet bordered surfaces and explicit stock states.
- A compact basket wordmark without supplier branding.
- Native system typography and readable light/dark role colors.
- Clear quantity, delivery-progress and server-confirmed order feedback.

## Colors

White owns website shelves; teal owns actions, focus and selected departments. Pale aqua groups search, delivery and basket regions. Dark green-black text and gray-green support text preserve readable hierarchy. Success accompanies explicit stock labels.

Native system/light/dark preferences select the role colors in `mobile/src/theme.tsx`: background, surface, tint, on-tint, text, muted, line, soft and error. Dark mode uses green-black surfaces with a lighter teal action and dark on-tint text. Exact pack photos retain white image surfaces in both modes. The basket mark follows tint/on-tint in native appearance; the website mark uses action/white. `/app-preview` and `/app-privacy` use their explicitly scoped extension roles.

**The Real Shelf Rule.** Display imported selling prices and actual stock. No invented markup, discount, rating or availability may be added to customer screens.

## Typography

The website uses self-hosted Poppins from the official Google Fonts distributions; its existing font licensing and source references remain authoritative. Preserve incumbent website typography outside the new customer wordmark. The wordmark uses the `customer-wordmark` role, stepping down to 21 CSS pixels on phones and 19 in the desktop staff header (17 in its phone layout).

Native text leaves `fontFamily` unset and uses the platform system font. The native body, heading, product-title, price, wordmark and tab roles are in the frontmatter; React Native uses numeric logical units while this portable spec expresses dimensions as pixel strings. Shelf titles use two lines with full names available on product detail and through accessibility labels. English/Urdu changes text, alignment and writing direction without claiming complete layout mirroring. System font scaling stays enabled; enlarged-text layout requires native QA.

**The Familiar Name Rule.** Keep real package names, brands and variants in ordinary case; package photography carries their own lettering.

## Layout

Preserve the website's department/catalog/basket structure and two-column phone shelves. Find a brand filtering is removed; product brand labels remain. The established header has a pale aqua announcement, white navigation, teal delivery selection and pale aqua search. The mobile grocery-list invitation uses one readable column with its title, description and action on separate rows; desktop retains the existing strip.

Native pages use the frontmatter page padding and grid gap. Measured content selects one column below 360 logical units, two below 700, three below 1000 and four thereafter. Five bottom tabs expose Shop, Categories, Basket, My orders and Help; Android windows at least 768 wide use a left rail. Search, lists, preferences, catalog, product, checkout and receipt details use a native stack; delivery-pin selection is modal. The compact home opening contains the customer mark, saved action, delivery locality and search, followed by a swipeable photo banner and horizontal department row. Language and appearance live in Help > Preferences. Basket access remains visible through the dock and tab badge.

Safe-area handling, iOS checkout keyboard avoidance and hiding tabs while typing are implemented. Native Back, gestures and safe areas need device verification. The `/app-preview` iframe is limited to 460 CSS pixels and visibly labelled as a browser preview; screenshots establish browser layout only.

## Elevation & Depth

Website cards retain thin borders at rest and the incumbent soft hover shadow. Basket and informational regions use pale aqua; existing bounded basket and overlay animations retain immediate reduced-motion feedback.

Native cards use flat role-based borders and tonal layering without a shared shadow token. Pressed primary buttons reduce opacity, while icon actions use the soft surface. Stack animation is iOS default or Android fade-from-bottom; the OS reduced-motion preference disables stack animation. The basket dock uses a brief 180 ms scale confirmation when quantities change and reduced motion is off. This does not claim every native modal transition is disabled.

**The Shelf Border Rule.** Use borders and tonal surfaces to separate grocery information; keep product photography clear of decorative depth.

## Shapes

Preserve unrelated incumbent website corner tokens. The new website basket mark uses the frontmatter customer-mark radius with a 48 CSS-pixel square, reduced to 42 on phones and staff headers. Its geometry comes from Lucide ShoppingBasket; native uses basket-outline in a 42-unit square with the same mark radius. These are icon-and-wordmark compositions, not new raster logos.

Native controls use 14-unit corners, fields 12, shelf cards and photo banners 16, and basket/summary containers 16. Other existing receipt/history panels keep their incumbent shapes. Circular icon actions are 48 square with radius 24. Primary buttons have minimum height 52; quantity-stepper targets are 48 wide and at least 50 high. Round department photographs and contained pack photographs remain distinct.

## Components

Stock and pending prices are explicit. Loading, empty, unavailable, retry and confirmed-order/local-save-warning states remain distinct. Disabled/busy controls expose accessibility state; errors use text alerts. Product photos have an explicit fallback.

Native Add becomes a quantity stepper and updates the Basket badge, capped visually at 99+. The dock opens the basket and shows product subtotal; delivery progress uses the real configured threshold. Pending attempts lock basket mutations and delivery fields. Lists are local named checklists, with separate actions for adding current available linked products, sending unchecked text to the store and sharing the list. Basket/product saves record product links; plain written entries are never silently treated as catalog matches. Repeat and recently viewed shelves refresh availability. Product detail offers related current products and an enlarged pack-photo modal.

Order steps follow server statuses, with refresh and private receipt-PDF sharing from saved snapshots. The existing picture-PDF renderer embeds Noto Sans/Noto Sans Arabic, paginates at A5 and uses authoritative saved photos/totals. Staff packing workflow ends at dispatch; only the owner closes an order after cash handover. No live rider position or online-payment state is implied.

Website full photographic campaigns and round department images retain their existing provenance in `public/images/README.md`; catalog sources remain in `work/image-sources.json`. No new raster was introduced for this identity refinement. Native icon mappings use SF Symbols on iOS and Material Community icons on Android where mapped, with Ionicons fallback. Sidecar native snippets are illustrative browser translations, not native-runtime evidence.

## Do's and Don'ts

### Do:
- **Do** use Daily Basket as a temporary customer wordmark and simple basket mark until the final name is confirmed.
- **Do** preserve exact pack photography, real brand/variant labels, imported prices and explicit stock states.
- **Do** scope native light/dark roles to the app and its identified preview/privacy wrappers.
- **Do** keep guest checkout, current-stock list/reorder checks and server-confirmed totals clear.
- **Do** retain supplier provenance, real contacts, 5 km PGECHS dispatch coverage, COD rules, compatible storage namespaces and authenticated staff tools.

### Don't:
- **Don't** restore Askari's name or supplier-logo artwork as the customer-facing identity.
- **Don't** import reference-store names, logos, promotions or unrelated departments.
- **Don't** invent selling prices, discounts, rewards, live tracking or payment confirmation.
- **Don't** present browser captures or JavaScript exports as native-device QA, signed installations or app-store publication.
- **Don't** finalize the temporary name or production identifiers without the owner's confirmation before the first production signing/EAS project.
