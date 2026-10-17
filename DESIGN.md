---
name: Askari Departmental Store
description: Real grocery shelves with a confident navy and gold basket, refined for the user's requested professional theme.
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
  mobile-heading: { fontSize: "23px", fontWeight: 700, lineHeight: 1.304348 }
  mobile-product-title: { fontSize: "16px", fontWeight: 600, lineHeight: 1.4375 }
  mobile-price: { fontSize: "19px", fontWeight: 700, lineHeight: 1.421053 }
  mobile-tab-label: { fontSize: "12px", fontWeight: 600 }
rounded:
  control: "7px"
  search: "10px"
  card: "14px"
  mobile-control: "14px"
  mobile-field: "12px"
  mobile-card: "18px"
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
---

# Design System: Askari Departmental Store

## Overview
The user explicitly selected Al-Fatah's current storefront styling. A live inspection confirmed white surfaces, pale aqua fields, teal actions and Poppins typography. Askari's own logo and grocery content remain authoritative.

The approved native customer extension carries that logo, teal action hierarchy and grocery photography into Expo/React Native. Native-specific tokens are prefixed `mobile-`; they apply to `mobile/App.tsx` and `mobile/src`, not to the incumbent website. The `mobile-preview-frame` token belongs only to the web preview wrapper. Existing website tokens remain unchanged.

## Colors
White owns the page and product shelves. Teal owns actions, focus and selected departments; pale aqua groups search, delivery and basket surfaces. Dark green-black is the main text, with readable gray-green supporting text. Success retains explicit stock labels alongside semantic green.

Native appearance follows the operating-system color scheme. The `mobile-light-*` and `mobile-dark-*` roles map directly to `mobile/src/theme.tsx`: background, surface, tint, on-tint, text, muted, line, soft and error. Dark mode uses green-black backgrounds and a lighter teal action with dark text. Exact product photos and the unchanged logo remain on white image surfaces in both modes. The browser wrapper in `/app-preview` uses the scoped preview frame, light text and light background roles; `/app-privacy` also uses the native light text role on white. These are extension colours, not a website palette replacement.

## Typography
Poppins is self-hosted from the official Google Fonts distributions, matching the observed reference. Headings use28px/600 desktop and24px on phones, with normal letter spacing. Product names use13px/500 desktop and12px on phones. Footer text uses Inter with Open Sans supporting copy, also observed in the reference. Font licenses and source URLs accompany the files.

Native text leaves `fontFamily` unset and uses the platform system font, rather than importing the website's Poppins. Native body text is 17 with line-height 25; headings are 23/30, product titles 16/23 and prices 19/27. The frontmatter expresses these React Native logical units as pixel strings for portable token tooling; the runtime uses numeric density-independent values. English/Urdu selection changes text and text alignment/writing direction, without claiming a fully mirrored layout. System font scaling remains enabled; enlarged-text layout still requires native QA.

## Layout
Preserve Askari's department/catalog/basket structure and two-column phone shelves. The Find a brand interface is removed, including its search, checkbox list and active brand chips. Product brand labels remain part of product identity. The header uses a pale aqua announcement, white navigation, pill-shaped teal delivery selection and pale aqua search. Catalog pages contain48 products.

Native pages use 20 logical-unit padding and a 12-unit shelf gap. Measured content width selects one column below 360, two below 700, three below 1000 and four thereafter. Shop, Categories, Basket, My orders and Help use bottom tabs; Android windows at least 768 wide use a left tab rail. Product, catalogue, checkout, receipt and list screens use a native stack; delivery-pin selection is modal. Safe-area insets, keyboard avoidance on iOS checkout and a tab bar hidden while typing are implemented. Platform Back, gestures and safe areas need device verification. The `/app-preview` iframe is limited to 460 CSS pixels and visibly labelled as a browser preview.

## Elevation & Depth
Product cards carry a thin border at rest, then a soft offset shadow on hover. Basket and informational regions use pale aqua without decorative effects.

Native cards are flat, with thin role-based borders and tonal surface changes; no shared shadow token is defined. Pressed buttons reduce opacity and icon actions use the soft surface. Stack animation uses the iOS default or Android fade-from-bottom; the OS reduced-motion preference disables stack animation. This does not claim every native modal animation has been disabled.

## Shapes
Cards use12px corners; controls use8px. Search and desktop delivery selection use pill shapes as in the selected reference. The original logo artwork is unchanged.

Native controls use 14-unit corners, fields 12, product cards 18 and basket/summary containers 16. Circular icon actions are 48 square with radius 24. Primary buttons have a minimum height of 52; quantity-stepper targets are 48 wide and at least 50 high. The logo retains its original artwork inside a white viewport; department photographs remain circular and pack photographs use contain sizing.

## Components
Stock and pending prices are explicit. Buttons, dialogs, forms, search results, counter metrics and Excel previews share the white/teal system. Existing bounded basket and overlay animations remain; reduced-motion retains immediate state feedback.

Native Add changes to a quantity stepper and updates the Basket badge, capped visually at 99+. Pending attempts lock basket mutations and checkout delivery fields. Busy and disabled controls expose accessibility state; errors are textual alerts. Product photos have an explicit fallback icon. Loading, empty, unavailable, retry and confirmed-order/local-save-warning states are distinct. Native icon mappings use SF Symbols on iOS and Material Community icons on Android where mapped, with Ionicons fallback (including WhatsApp on iOS); the browser uses its own icon implementation. The sidecar's native snippets are illustrative browser translations of native primitives, not native-runtime render evidence.

## Do's and Don'ts
Preserve Askari identity and verified product photography. Match the observed typography and color relationships without importing Al-Fatah's name, logo, promotions or unrelated departments. Keep staff tools authenticated. Show only Askari's imported prices as selling prices.

Do scope native light/dark roles to the app and its explicitly identified preview/privacy wrappers. Do preserve real pack identity, explicit stock states, guest checkout and server-confirmed totals. Don't present browser screenshots or exported JavaScript bundles as native-device QA, signed installations or app-store publication. Native QA/build limits are recorded in `PRODUCT.md`, `mobile/README.md` and `.impeccable/surfaces/mobile.md`.

The inherited seed-reference metadata verification limit remains documented.

## Shopping and receipt refinement

Full-width photographic campaigns use original generated grocery, breakfast and home-care scenes with readable HTML copy over a quiet left area. Phones stack the image above the copy. Manual carousel changes use one short fade. Nine round department photos lift and zoom slightly on hover, keyboard focus and press; reduced-motion disables these effects. Separate category and product-detail pages share the header and basket. Product detail prioritizes the exact pack photo and size. Packing receipts use a compact image/name/quantity/line-total grid, authoritative totals and an explicit packing-copy label. Staff workflow ends at dispatch; only the owner closes orders after cash handover.

The order desk and Discord share a PDF renderer for the picture packing receipt. Noto Sans and Noto Sans Arabic are embedded, receipts paginate at A5, and all photos and totals come from saved snapshots. The original compact print view and PNG export remain available.
