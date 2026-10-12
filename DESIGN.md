---
name: Askari Departmental Store
description: Real grocery shelves with a confident navy and gold basket, refined for the user's requested professional theme.
colors:
  navy: "#0d1723"
  action: "#e9bc6d"
  action-hover: "#f1cf92"
  canvas: "#0d1723"
  white: "#152537"
  ink: "#edf2f6"
  secondary: "#b3c1ce"
  metadata: "#b6c5d3"
  line: "#304256"
  surface: "#1c3044"
  gold: "#e9bc6d"
  gold-fill: "#e9bc6d"
  success: "#8cd9b5"
  quantity-surface: "#27445b"
  quantity-border: "#6d7b7c"
  discount-surface: "#594629"
  discount-text: "#ffe0a0"
typography:
  headline: { fontFamily: "Figtree, sans-serif", fontSize: "36px", fontWeight: 700, lineHeight: 1.22, letterSpacing: "-0.035em" }
  headline-mobile: { fontFamily: "Figtree, sans-serif", fontSize: "27px", fontWeight: 700, lineHeight: 1.25 }
  body: { fontFamily: "Figtree, sans-serif", fontSize: "14px", fontWeight: 400, lineHeight: 1.5 }
  product-title: { fontFamily: "Figtree, sans-serif", fontSize: "14px", fontWeight: 650, lineHeight: 1.45 }
  price: { fontFamily: "Figtree, sans-serif", fontSize: "18px", fontWeight: 750, letterSpacing: "-0.025em" }
  metadata: { fontFamily: "Figtree, sans-serif", fontSize: "11px", fontWeight: 400 }
rounded:
  control: "7px"
  search: "10px"
  card: "14px"
spacing:
  shelf-gap: "17px"
  rail-gap: "24px"
  desktop-gutter: "56px"
  mobile-gutter: "18px"
components:
  button-primary: { backgroundColor: "{colors.action}", textColor: "{colors.white}", rounded: "{rounded.control}", height: "42px" }
  button-basket: { backgroundColor: "{colors.gold-fill}", textColor: "{colors.navy}", rounded: "{rounded.control}" }
  product-card: { backgroundColor: "{colors.white}", textColor: "{colors.ink}", rounded: "{rounded.card}" }
  basket-rail: { backgroundColor: "{colors.navy}", textColor: "{colors.white}", rounded: "{rounded.card}", padding: "23px 21px 21px" }
  quantity: { backgroundColor: "{colors.quantity-surface}", textColor: "{colors.action}", rounded: "{rounded.control}", height: "39px" }
---

# Design System: Askari Departmental Store

The user requested a dark, professional grocery store. Charcoal navy (#0d1723) carries the page; shelves use #152537, raised controls #1c3044, and dividers #304256. Warm gold (#e9bc6d) identifies actions and keyboard focus. Body text is #edf2f6 and supporting text #b3c1ce. Real package photographs retain bright backgrounds so packaging stays legible; the supplied logo is unchanged.

The incumbent filter/catalog/basket layout remains. Products are paged 48 at a time; brand search supports the expanded catalog. Stock always has explicit text. Unpriced products say Price pending and cannot enter the basket. No retailer prices, fake ratings or discounts are presented as Askari inventory.

Figtree is retained. Headlines are38px desktop/29px mobile; product titles14px, prices18px and metadata11px. Cards use14px corners. Dialogs, search, forms, checkout, order counter and inventory imports share the dark palette.

Existing hover lift, contained image zoom, quantity confirmations and native overlay transitions are retained. Motion lasts150–350ms; reduced-motion removes spatial movement and animations. Loading blocks product additions until the current query completes.

Excel imports require exact product IDs, catalog codes, barcodes or unambiguous product names. A matched positive price makes a product available; blank prices and omitted products are out of stock. Ambiguous, invalid and duplicate rows require correction before an atomic import.

The inherited seed-reference metadata verification limit remains. This refinement makes no unsupported claim that that check passed. Local browser inspection was blocked by the browser URL policy during this pass; production inspection and automated checks are recorded separately.
