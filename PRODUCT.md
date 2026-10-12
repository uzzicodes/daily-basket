# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
User specified Next.js 14+ App Router, React, TypeScript, Tailwind CSS, Lucide React, Supabase PostgreSQL, React Context or Zustand, Discord webhook and WhatsApp links. Local installation and Vercel deployment instructions are required.

## Users
Confirmed in the user's pasted brief: Lahore households shopping for supermarket essentials, including customers who prefer handwritten grocery lists. Store-counter staff pack orders, manage deliveries, print slips and collect COD.

## Product Purpose
Build a full grocery-only e-commerce application for Askari Departmental Store Lahore. Customers find essentials, choose quantities, provide an address, and order with Cash on Delivery or WhatsApp.

## Operating Context
The brief prioritizes smartphone shopping. Deliver only to the Lahore areas listed in lib/constants.ts. Staff use a protected /admin page on the store counter laptop.

## Capabilities and Constraints
Nine categories listed in the original brief, including laundry, cleaning, baby care and personal hygiene. No electronics, appliances, toys, clothing or mobile accessories. A comprehensive catalog within the nine grocery departments with verified source photography and Excel-driven availability. Live search, category filters, four sorting modes, persistent basket, delivery-progress calculation, sliding checkout, list-by-photo or text, admin order pipeline, packing slips and daily metrics. Discord alerts are explicitly deferred by the user.

Delivery is free at Rs. 2,999 and above; below the threshold the fee is Rs. 150. The requested announcement advertises 45-minute express delivery. This is supplied copy, not an independently verified service promise. Live catalog prices are blank until the store imports its own price list; imported positive prices activate matched items and all other items remain out of stock.

## Brand Commitments
Original brief used Al-Barakah as the store name. The user later supplied the real Askari Departmental Store logo and identified it as their store logo, so the actual name and logo take precedence. Preserve that artwork, with the original brief's Naheed.pk-inspired modern minimalist aesthetic, deep emerald #044E32 / #059669, dark slate and restrained gold/amber accents. Real product photography is mandatory. User requires Impeccable and template previews before further final UI implementation; three previews were presented and the user delegated selection to the agent. Quick Basket was selected. The user subsequently requested a better, more professional theme and animations; the user has now requested a dark theme. The latest user request chooses Al-Fatah’s white/teal palette, Poppins fonts and storefront styling, and removes the Find a brand filter. The supplied logo is unchanged.

## Evidence on Hand
Original brief in the user attachment. 18 product-image URLs verified to return image responses; sources recorded in work/image-sources.json. User-owned logo is public/askari-logo.png. WhatsApp contact is the user-provided 03084555567. Supabase project Askari Departmental Store (gxvkyigawrgdmvdhnjtc) is healthy in Mumbai in the user-selected organization. Schema and seed migrations are applied; checkout/idempotency and private permissions passed a rollback-only check against the real database. Server credentials and counter access are configured privately. Legacy demonstration products are archived. The new catalog is unpriced and out of stock until an Excel price list is imported. Inventory previews reject uncertain matches before saving.

## Product Principles
- Make everyday grocery shopping fast on phones.
- Preserve grocery-only scope and real product identity.
- Keep checkout totals authoritative on the server.
- Support the handwritten-list habit honestly.
- Never claim an order is saved when persistence is unavailable.

## Open Decisions
The user supplied 03084555567 as the WhatsApp contact; use international format 923084555567. Store inventory values and operational delivery capacity remain unconfirmed. Database and counter access are configured, and credentials are excluded from source. The user explicitly deferred Discord integration on this turn; no Discord calls or queued alerts are included in active checkout.
