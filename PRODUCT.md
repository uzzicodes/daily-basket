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
Nine categories listed in the original brief, including laundry, cleaning, baby care and personal hygiene. No electronics, appliances, toys, clothing or mobile accessories. At least 16 realistic Pakistani products with verified photography. Live search, category and brand filters, four sorting modes, persistent basket, delivery-progress calculation, sliding checkout, list-by-photo or text, admin order pipeline, packing slips and daily metrics. Discord alerts are explicitly deferred by the user.

Delivery is free at Rs. 2,999 and above; below the threshold the fee is Rs. 150. The requested announcement advertises 45-minute express delivery. This is supplied copy, not an independently verified service promise. Prices and ratings in the seed are demonstration catalog values and must be reviewed by the store before launch.

## Brand Commitments
Original brief used Al-Barakah as the store name. The user later supplied the real Askari Departmental Store logo and identified it as their store logo, so the actual name and logo take precedence. Preserve that artwork, with the original brief's Naheed.pk-inspired modern minimalist aesthetic, deep emerald #044E32 / #059669, dark slate and restrained gold/amber accents. Real product photography is mandatory. User requires Impeccable and template previews before further final UI implementation; three previews were presented and the user delegated selection to the agent. Quick Basket was selected.

## Evidence on Hand
Original brief in the user attachment. 18 product-image URLs verified to return image responses; sources recorded in work/image-sources.json. User-owned logo is public/askari-logo.png. WhatsApp contact is the user-provided 03084555567. No live inventory, Supabase credentials or administrator secret supplied so far.

## Product Principles
- Make everyday grocery shopping fast on phones.
- Preserve grocery-only scope and real product identity.
- Keep checkout totals authoritative on the server.
- Support the handwritten-list habit honestly.
- Never claim an order is saved when persistence is unavailable.

## Open Decisions
The user supplied 03084555567 as the WhatsApp contact; use international format 923084555567. Inventory values, Supabase/admin credentials and operational delivery capacity remain unconfirmed. The user explicitly deferred Discord integration on this turn; no Discord calls or queued alerts are included in active checkout.
