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
  headline: { fontFamily: "Figtree, sans-serif", fontSize: "38px", fontWeight: 700, lineHeight: 1.22, letterSpacing: "-0.035em" }
  headline-mobile: { fontFamily: "Figtree, sans-serif", fontSize: "29px", fontWeight: 700, lineHeight: 1.25 }
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
  button-primary: { backgroundColor: "{colors.action}", textColor: "{colors.navy}", rounded: "{rounded.control}", height: "42px" }
  button-basket: { backgroundColor: "{colors.gold-fill}", textColor: "{colors.navy}", rounded: "{rounded.control}" }
  product-card: { backgroundColor: "{colors.white}", textColor: "{colors.ink}", rounded: "{rounded.card}" }
  basket-rail: { backgroundColor: "{colors.navy}", textColor: "{colors.white}", rounded: "{rounded.card}", padding: "23px 21px 21px" }
  quantity: { backgroundColor: "{colors.quantity-surface}", textColor: "{colors.action}", rounded: "{rounded.control}", height: "39px" }
---

# Design System: Askari Departmental Store

## Overview
The user's requested dark grocery store keeps the Quick Basket layout and supplied logo. The interface makes finding and pricing everyday essentials the main task.

## Colors
Charcoal navy carries the page, dark shelf panels group products, and raised slate controls establish elevation. Warm gold marks actions and keyboard focus. Off-white body text and supporting slate remain readable on each dark surface. Success uses mint plus explicit text. Product photographs sit on bright backgrounds so labels stay legible.

## Typography
Figtree remains the storefront and counter voice. Headlines are38px desktop and29px mobile; product titles14px, prices18px and metadata11px. Long product names wrap within three lines. Totals use tabular numerals.

## Layout
The desktop filter/catalog/basket arrangement and two-column phone shelves remain. Products load48 at a time. Brand search handles the expanded catalog. On phones the availability control follows the heading; drawers and filter dialogs preserve the shopping context.

## Elevation & Depth
Shelves use a thin border at rest. Hover lifts the card gently and contained photography enlarges. Dialog backdrops use a dark tint, and raised controls remain distinct without glass effects.

## Shapes
Cards and the basket use14px corners. Controls use7px and search10px. The checkout drawer retains square outer edges. The logo viewport crops transparent padding only.

## Components
Unpriced cards say Price pending and Out of stock; unavailable items cannot be added. Stock status has explicit text alongside color. Exact Excel matches preview their result before an atomic import.

Existing quantity confirmations, image hover and native overlay transitions remain bounded to150–350ms. Reduced-motion removes spatial movement and animations while retaining state feedback. Focus returns to the invoking control when dialogs close. Error, loading, empty and disabled states use the same dark system.

## Do's and Don'ts
Preserve the supplied logo, real package photos and product identity. Keep actions gold and stock semantic. Never show retailer prices or invented ratings as Askari inventory. Do not add looping decoration or make shopping wait for motion.

The inherited seed-reference metadata verification limitation remains documented in the surface brief. Desktop, intermediate and phone captures informed one correction batch and a final confirmation.
