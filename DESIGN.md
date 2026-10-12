---
name: Askari Departmental Store
description: Familiar Pakistani groceries on white shelves with emerald actions and a neighbourhood counter.
colors:
  green: "#044e32"
  ink: "#21392d"
  secondary: "#597064"
  line: "#dce6dd"
  surface: "#f1f5ef"
  gold: "#b48d45"
  white: "#ffffff"
  admin-canvas: "#f5f8f1"
  add-surface: "#f1f6ec"
  quantity-surface: "#e0edd7"
  discount-surface: "#f6f0dc"
  discount-text: "#796023"
  error-surface: "#fff1e7"
  error-text: "#8b3e20"
typography:
  headline:
    fontFamily: "Figtree, sans-serif"
    fontSize: "33px"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.03em"
  headline-mobile:
    fontFamily: "Figtree, sans-serif"
    fontSize: "26px"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Figtree, sans-serif"
    fontSize: "22px"
    fontWeight: 650
    lineHeight: 1.5
    letterSpacing: "-0.035em"
  product-title:
    fontFamily: "Figtree, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Figtree, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  supporting:
    fontFamily: "Figtree, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Figtree, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.5
  metadata:
    fontFamily: "Figtree, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.5
  price:
    fontFamily: "Figtree, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "-0.025em"
rounded:
  badge: "3px"
  selection: "4px"
  control: "5px"
  search: "6px"
  inset: "8px"
  suggestion: "10px"
  card: "12px"
  pill: "20px"
spacing:
  icon-gap: "7px"
  small-gap: "8px"
  field-padding: "12px"
  card-gap: "14px"
  inset-padding: "15px"
  mobile-gutter: "18px"
  rail-gap: "24px"
  desktop-gutter: "56px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
    typography: "{typography.label}"
  button-secondary:
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
    padding: "11px"
    typography: "{typography.label}"
  button-add:
    backgroundColor: "{colors.add-surface}"
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
    height: "36px"
    width: "100%"
    typography: "{typography.label}"
  quantity:
    backgroundColor: "{colors.quantity-surface}"
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
    height: "36px"
    width: "100%"
    typography: "{typography.label}"
  product-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.search}"
    padding: "13px 15px"
  field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "{spacing.field-padding}"
    typography: "{typography.body}"
  filter-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.green}"
    rounded: "{rounded.pill}"
    padding: "5px 8px"
    typography: "{typography.metadata}"
  discount:
    backgroundColor: "{colors.discount-surface}"
    textColor: "{colors.discount-text}"
    rounded: "{rounded.badge}"
    padding: "3px 6px"
  metric-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.green}"
    rounded: "{rounded.card}"
    padding: "22px"
---

# Design System: Askari Departmental Store

## Overview

**Creative North Star: "The Neighbourhood Grocery Shelf"**

The built system follows the chosen Quick Basket direction: familiar Pakistani packaging sits on quiet white shelves, with emerald actions and gently tinted supporting surfaces. Figtree gives the storefront and staff counter a shared, compact voice. Product identity comes from real package photographs and the user-supplied Askari logo.

The original logo artwork stays unaltered. Its transparent padding is removed from the visible frame through CSS positioning and clipping; the artwork's orange and blue remain part of that asset rather than becoming interface accents. Catalog and admin preview notices distinguish demonstration values from live operations. This document records the current implementation; it does not certify an entire review or launch.

**Key Characteristics:**

- White product shelves, emerald actions and restrained amber savings.
- Compact Figtree hierarchy with readable, muted green supporting text.
- Contained package photographs, thin separators and gently curved panels.
- Quantity controls and delivery progress keep basket changes visible.
- Storefront and staff counter share controls, fields and state language.

## Colors

Emerald anchors actions; pale green surfaces separate supporting information without overwhelming package photography.

### Primary

- **Store Emerald** (`green`): delivery strip, primary buttons, selected departments, basket progress and important staff figures.
- **Quiet Gold** (`gold`): keyboard focus outlines. Savings use the separate muted amber discount tokens.

### Neutral

- **Shelf White** (`white`): page, product cards, dialogs, drawer and metric cards.
- **Grocery Ink** (`ink`): headings, product names and prices.
- **Supporting Green** (`secondary`): brands, units, helper copy, counts and descriptions.
- **Shelf Divider** (`line`): borders, rail separators and totals.
- **Soft Green** (`surface`): search, selected filters, basket notices and list support.
- **Counter Canvas** (`admin-canvas`): staff login and dashboard background.

### Named Rules

**The Action Emerald Rule.** Use emerald for actionable controls, selection and basket progress; keep merchandise backgrounds white.

Savings and errors are functional accents. Discount labels use muted amber; validation messages pair the warm error background with darker error text. Stock labels also use explicit words, so their meaning does not depend on color.

The sidecar supplies synthesized eight-step OKLCH ramps for the design panel. They are preview metadata, not additional application palette tokens; the frontmatter retains the actual source colors.

## Typography

**Display Font:** Figtree, sans-serif. There is no separate decorative display face.
**Body Font:** Figtree, sans-serif.

**Character:** One sans-serif family carries both friendly storefront copy and practical counter information. Weight and spacing provide hierarchy instead of font changes.

### Hierarchy

- **Headline:** storefront introduction; the mobile sibling reduces its size while preserving weight and tracking.
- **Title:** basket rail heading. Dialog titles use (28px), drawer titles (25px), and pipeline headings (23px).
- **Product title:** compact two-line name block, with a minimum height of (42px) on desktop and (40px) on mobile. Mobile line height becomes (1.4).
- **Body:** base text and desktop field values.
- **Supporting:** explanatory paragraphs, with more open line height.
- **Label:** field labels and controls. Primary buttons use (13px); secondary and add controls use (12px).
- **Metadata:** brands, units, counts and supporting totals. Savings badges use (10px).
- **Price:** catalog amount; crossed-out prices stay smaller and secondary.
- **Counter figures:** dashboard values use tabular numerals, (32px) and weight (650); mobile figures use (30px).

### Named Rules

**The Familiar Name Rule.** Keep package names and brands in ordinary case; package photography carries the brand's own lettering.

## Layout

The storefront container has a maximum width of (1440px), centered with (56px) side gutters. Below (1200px), gutters become (28px); below (600px), they become (18px). The narrowest treatment below (360px) uses (14px).

Desktop uses a filter rail, product shelf and basket rail: (170px / flexible / 278px), with (24px) gaps. The shelf is three columns with (14px) gaps. Above (1550px), rails grow to (190px / 300px) and gaps to (30px). At (1200px), the shelf becomes two columns; at (850px), the basket rail disappears. Below (600px), filters move into a dialog and the catalog remains two columns with (13px) gaps.

The white navbar sticks to the viewport top. Its desktop main row is (100px); on mobile it is (155px), with a full-width search row and delivery selector below the logo/actions. Departments scroll horizontally rather than wrap. A nonempty mobile basket creates a fixed emerald summary bar (12px) from the bottom and (18px) from the sides. Footer padding reserves room for it.

Product photography uses contained images, not cropped packages: desktop photo area (146px) with a maximum image height of (118px); mobile area (142px) and maximum image height (109px). The card's textual rhythm stays consistent despite different package silhouettes.

The counter uses a (1440px) maximum main area with (36px) side padding, three metric columns and three pipeline columns. At (850px), pipeline stages stack with up to two order cards per row; below (600px), metric and order cards become single columns.

The drawer occupies the right edge at a width of (490px) or the full viewport when narrower. Header and totals/actions remain separate from the scrolling middle. The paper-list and filter dialogs center at a maximum width of (490px), use a (90dvh) maximum height and scroll when necessary.

## Elevation & Depth

Cards and counter panels stay flat: thin borders and tinted insets provide separation. Shadows belong to overlays and the persistent mobile basket.

### Shadow Vocabulary

- **Search suggestions** (`0 10px 24px #13391c20`): separates the quick-add dropdown from the page.
- **Dialog** (`0 24px 70px #0003`): floating paper-list/filter dialog and drawer.
- **Mobile basket** (`0 4px 16px #163d2a2b`): fixed checkout summary above the scrolling shelf.
- **Modal backdrop** (`#14362670`): green-tinted dimming behind native dialogs.

### Named Rules

**The Shelf Border Rule.** Product and metric cards use borders at rest; overlay depth comes from the existing shadow vocabulary.

## Shapes

The recurring panel radius is the card token; controls use the smaller control token. Supporting basket notices and upload areas use the inset radius. Active filter chips and status pills are compact capsules. The full-height checkout drawer has square outer corners.

Use thin solid borders for cards, fields and secondary controls; the paper-photo upload uses a dashed border. Line icons are Lucide SVGs, with small icon/text gaps. The logo is an artwork viewport: desktop frame (210px × 65px), mobile (180px × 56px), with the image width (155.12%), left offset (-25.09%) and top offset (-144.92%) preserving the supplied artwork while clipping transparent padding.

## Components

### Buttons

Compact, direct actions. Primary uses emerald and white with the control radius; hover darkens toward `#096642`. Secondary controls use a pale surface (`#f9fbf6`), divider border and emerald text, becoming `#edf4e6` on hover. Disabled buttons lower opacity to (.45) and show a unavailable cursor.

Button, link and input keyboard focus uses a gold outline (3px) offset by (3px). Coarse pointers raise icon, quantity, add, department, basket and filter controls to at least (40px) in the specified dimension.

### Chips

Active brand and savings filters use the soft-green capsule with a small close icon. Selected departments use soft green and emerald text, with heavier weight; unselected departments use supporting text. Discount badges are small amber rectangles near the photo's top-left corner.

### Cards / Containers

Product cards use white, a thin divider border and the card radius. Hover changes border color to `#afc3ac` and enlarges the contained photo to (1.05) over (.3s); border transitions take (.2s). The body uses (8px 13px 13px) desktop padding and (8px 12px 12px) on mobile.

Metric cards share the white bordered shell. Pipeline empty states use a tinted inset with a line icon and explanatory sentence. Actual order-card details are defined in source; the captured dashboard evidence shows empty layout preview columns, not live customer records.

### Inputs / Fields

Fields use visible labels, white backgrounds, a restrained green border (`#b9c9b9`), control radius and field padding. Mobile field values and search input use (16px), while placeholders and supporting text remain smaller. Textareas resize vertically. File selection uses a full-area transparent native input over a dashed, pale upload panel.

Validation errors appear as warm tinted text blocks with `role="alert"`. Catalog and counter configuration notices remain visible; no order success screen is shown unless the saved-order response is present.

### Navigation

The original logo links home. Search filters the catalog and opens quick-add results while focused; Escape dismisses results and Enter moves to the catalog. Delivery uses a labeled native select. Departments form a horizontal scrolling row, with emerald and weight (700) for the active item. Mobile removes department icons and text labels from the paper-list action while preserving its accessible name.

### Basket and Quantity Controls

Add becomes a pale-green minus/count/plus stepper. Count changes use a polite live region; plus/minus buttons name the product. Compact steppers measure (92px × 30px) on fine pointers, increasing to (108px × 40px) for coarse pointers. Out-of-stock add and quantity limits disable the affected action.

The basket rail, mobile bar and drawer share current quantities and totals. Delivery progress animates its width over (.25s). Empty basket, free-delivery eligibility, address entry, validation error and saved-order success have distinct copy and layouts.

### Dialogs and Paper Lists

Native modal dialogs provide modality; Escape, close buttons and backdrop clicks close them, and body scrolling is locked while open. The centered dialog enters with a (10px) upward travel and opacity over (.2s ease-out). Checkout slides from the right over (.25s) using `cubic-bezier(.16,1,.3,1)`.

Paper lists support text and a selected photo. Sharing copy explains that desktop users must attach the photo in WhatsApp after it opens. Reduced-motion preference disables CSS transitions, animations, photo enlargement and CSS smooth scrolling.

### Counter Preview

The login, preview banner, empty pipeline, disabled refresh and zero metrics honestly describe the disconnected state. Refresh, printing and order progression controls are defined for authenticated data. No Supabase/admin credentials are available in the checked session; those live states are source-defined rather than visually verified. WhatsApp uses the confirmed international store number (923084555567); Discord was deferred. These are operational context, not reusable visual tokens.

## Do's and Don'ts

### Do:

- **Do** preserve the user-supplied logo artwork and crop only its transparent padding through the existing viewport.
- **Do** show actual package photography with contain sizing and legible brand, unit and price text.
- **Do** reuse emerald actions, flat bordered shelves and pale-green supporting insets.
- **Do** keep the mobile two-column shelf, visible delivery selection and accessible names for icon actions.
- **Do** expose preview, validation, disabled, empty and success states with explicit text.

### Don't:

- **Don't** redraw, recolor or replace the supplied logo.
- **Don't** turn discount amber into a competing large-area brand accent.
- **Don't** inherit hidden decorative eyebrow strings as a new visual pattern.
- **Don't** describe demonstration inventory, prices or empty admin preview metrics as live data.
- **Don't** claim persistence or photo attachment succeeded when the configured integration cannot do it.

Not canonized or repaired in this documentation pass: hidden eyebrow markup remains in modal source and is not a visual-system pattern; search removes the input outline without a wrapper focus treatment, and the global explicit focus selector omits textarea/select, so full keyboard-focus coverage is not asserted. PRODUCT.md's older evidence sentence still says no WhatsApp number was supplied, while its newer open decision and the active build use the confirmed number. Documentation-only scope leaves these source/product issues unchanged.

Checked evidence: `app/globals.css`; `components/Storefront.tsx`, `Navbar.tsx`, `ProductCard.tsx`, `StoreLogo.tsx`, `CartDrawer.tsx`, `PaperListModal.tsx`, `AdminDashboard.tsx` and `Modal.tsx`; `PRODUCT.md`; `.impeccable/surfaces/app-page-tsx.md`; all six desktop/mobile storefront, admin and checkout review rasters; both output first-screen rasters. The reported review UI/copy fixes are resolved with no reported regressions. The installed engine does not support the required seed-reference verification; this remains a tooling limitation recorded in the route brief, not a visual defect or complete review/ship claim.

