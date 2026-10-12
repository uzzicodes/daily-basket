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
typography:
  headline: { fontFamily: "Poppins, sans-serif", fontSize: "28px", fontWeight: 600, lineHeight: 1.22, letterSpacing: "-0.035em" }
  headline-mobile: { fontFamily: "Poppins, sans-serif", fontSize: "24px", fontWeight: 700, lineHeight: 1.25 }
  body: { fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 400, lineHeight: 1.5 }
  product-title: { fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 650, lineHeight: 1.45 }
  price: { fontFamily: "Poppins, sans-serif", fontSize: "18px", fontWeight: 750, letterSpacing: "-0.025em" }
  metadata: { fontFamily: "Poppins, sans-serif", fontSize: "11px", fontWeight: 400 }
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
  button-primary: { backgroundColor: "{colors.action}", textColor: "#ffffff", rounded: "{rounded.control}", height: "42px" }
  button-basket: { backgroundColor: "{colors.gold-fill}", textColor: "{colors.navy}", rounded: "{rounded.control}" }
  product-card: { backgroundColor: "{colors.white}", textColor: "{colors.ink}", rounded: "{rounded.card}" }
  basket-rail: { backgroundColor: "{colors.navy}", textColor: "{colors.white}", rounded: "{rounded.card}", padding: "23px 21px 21px" }
  quantity: { backgroundColor: "{colors.quantity-surface}", textColor: "{colors.action}", rounded: "{rounded.control}", height: "39px" }
---

# Design System: Askari Departmental Store

## Overview
The user explicitly selected Al-Fatah's current storefront styling. A live inspection confirmed white surfaces, pale aqua fields, teal actions and Poppins typography. Askari's own logo and grocery content remain authoritative.

## Colors
White owns the page and product shelves. Teal owns actions, focus and selected departments; pale aqua groups search, delivery and basket surfaces. Dark green-black is the main text, with readable gray-green supporting text. Success retains explicit stock labels alongside semantic green.

## Typography
Poppins is self-hosted from the official Google Fonts distributions, matching the observed reference. Headings use28px/600 desktop and24px on phones, with normal letter spacing. Product names use13px/500 desktop and12px on phones. Footer text uses Inter with Open Sans supporting copy, also observed in the reference. Font licenses and source URLs accompany the files.

## Layout
Preserve Askari's department/catalog/basket structure and two-column phone shelves. The Find a brand interface is removed, including its search, checkbox list and active brand chips. Product brand labels remain part of product identity. The header uses a pale aqua announcement, white navigation, pill-shaped teal delivery selection and pale aqua search. Catalog pages contain48 products.

## Elevation & Depth
Product cards carry a thin border at rest, then a soft offset shadow on hover. Basket and informational regions use pale aqua without decorative effects.

## Shapes
Cards use12px corners; controls use8px. Search and desktop delivery selection use pill shapes as in the selected reference. The original logo artwork is unchanged.

## Components
Stock and pending prices are explicit. Buttons, dialogs, forms, search results, counter metrics and Excel previews share the white/teal system. Existing bounded basket and overlay animations remain; reduced-motion retains immediate state feedback.

## Do's and Don'ts
Preserve Askari identity and verified product photography. Match the observed typography and color relationships without importing Al-Fatah's name, logo, promotions or unrelated departments. Keep staff tools authenticated. Show only Askari's imported prices as selling prices.

The inherited seed-reference metadata verification limit remains documented.
