---
name: Askari Departmental Store
description: Real grocery shelves with a confident navy and gold basket, refined for the user's requested professional theme.
colors:
  navy: "#10283f"
  action: "#143c56"
  action-hover: "#1c506f"
  canvas: "#f6f8fb"
  white: "#ffffff"
  ink: "#203548"
  secondary: "#607184"
  metadata: "#627387"
  line: "#dce4eb"
  surface: "#edf3f7"
  gold: "#ad7318"
  gold-fill: "#efc678"
  success: "#1d7554"
  quantity-surface: "#e4eff7"
  quantity-border: "#b9cfdf"
  discount-surface: "#fff0cd"
  discount-text: "#825c14"
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

## Overview
The existing Quick Basket experience is preserved. At the user's request, the interface now draws navy and gold from the supplied logo while keeping real packaging photographs on bright white shelves. The logo artwork is unchanged. Cool neutral surfaces and a dark basket rail strengthen task hierarchy without adding new claims, content or workflows.

## Colors
Navy owns the delivery strip and desktop basket region. Action Blue owns the shopping controls and selected filters. Warm gold marks the dark-rail checkout, savings and keyboard focus. Stock remains semantically green with explicit text. White product cards sit on a cool-white canvas; supporting text is slate-blue. The legacy `--green` CSS property aliases Action Blue for compatibility, rather than representing a separate palette.

Body and metadata foreground/background pairs were measured at desktop, tablet and phone widths. Product brands, units and crossed-out prices use `#627387` with 4.86:1 contrast on white; gold savings text uses 5.33:1 on its pale background. Dark-rail supporting text uses `#c3d4e2` with 9.9:1 on navy. Disabled controls are clearly disabled and do not define active contrast targets.

## Typography
Figtree remains the shared storefront/counter voice. Hierarchy comes from weight and spacing: introduction 36px/700, mobile 27px/700, product name 14px/650, catalog price 18px/750 (17px mobile), metadata 11px. No decorative eyebrow labels are introduced. Basket totals use tabular numerals.

## Layout
Preserve the incumbent desktop filter/catalog/basket topology and two-column mobile shelf. Desktop container gutters remain 56px and mobile gutters 18px. The product gap is 17px desktop and 13px mobile. Desktop basket rail has a navy surface and internal padding; it remains sticky and disappears below 850px. Mobile keeps the sticky search and delivery selector, and shows a navy basket bar only when nonempty. The mobile logo row is kept clear of search by the existing 155px header with 87px bottom padding.

## Elevation & Depth
Product cards use one thin border at rest. On hover-capable devices, the border becomes transparent and a soft offset shadow takes over as the card lifts 3px; contained photographs enlarge to 1.05. Overlays and the fixed mobile basket use restrained navy-tinted shadows. No glass effects or loops are used.

## Shapes
White shelves and dark basket use 14px corners. Shopping controls and native fields use 7px corners; search uses 10px desktop and 8px mobile. The checkout drawer keeps square outer edges. Package images remain contained. The logo viewport crops only transparent padding and never recolors the artwork.

## Components
Primary actions use Action Blue/white; the dark basket's primary checkout uses gold/navy. Add becomes a blue stepper. Each changed count receives a 200ms confirmation; the stepper briefly acknowledges the initial addition with a warm fill, while totals respond over 280ms. The dark rail has its own confirmation fill to preserve contrast throughout animation.

Native dialogs and the drawer use CSS `@starting-style` plus discrete display/overlay transitions: centered dialogs settle 8px, checkout slides along the right edge, and the backdrop dims to navy. Closing uses the same spatial relationship. Browsers without discrete-transition support retain native immediate-close behavior. All controls remain usable during repeated interactions.

Animations use `cubic-bezier(.16,1,.3,1)` and durations from 150–350ms. There is no page-load choreography or infinite motion. Reduced-motion preference removes spatial movement/animations; changed quantities, colors and totals still communicate the action. Keyboard focus returns to the invoking control when a dialog closes; fields have visible blue focus rings.

The catalog and empty administrator preview retain explicit demonstration notices. Supabase credentials are still required for live COD/admin operations. WhatsApp remains the user-provided 923084555567. Discord stays deferred.

## Do's and Don'ts
- Preserve the supplied logo and real package photographs.
- Keep primary shopping actions blue, dark-basket checkout gold, and stock green.
- Keep metadata readable and use text alongside state colors.
- Preserve the existing shopping routes, quantities and checkout behavior.
- Use motion to confirm basket state or overlay continuity; never make shopping wait.
- Do not add looping decoration, recolor the logo, or claim demonstration values are live inventory.

The inherited seed-reference verification limitation remains documented in the surface brief. This refinement adds no new direction roll and does not assert that unsupported metadata check passed.
