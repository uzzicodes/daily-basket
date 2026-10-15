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
The brief prioritizes smartphone shopping. Deliver only within a 5 km straight-line radius of Askari Departmental Store, 84 Block C2, PGECHS Phase 1, Lahore (31.41216075, 74.27587375), as confirmed by the owner’s Google Maps link. A customer must choose an eligible delivery pin; the API and database both enforce the radius. Staff use a protected /orders desk on the store counter laptop. The owner has a separate protected /admin dashboard for sales and inventory.

## Capabilities and Constraints
Nine categories listed in the original brief, including laundry, cleaning, baby care and personal hygiene. No electronics, appliances, toys, clothing or mobile accessories. A comprehensive catalog within the nine grocery departments with verified source photography and Excel-driven availability. A banner-style storefront welcome and a prominent, fully visible original logo, followed by live search, category filters, four sorting modes, persistent basket, delivery-progress calculation, sliding checkout, list-by-photo or text, a staff order desk with exact product photos, pack-size and quantity checks, picture packing slips and owner-only COD settlement; a separate owner dashboard with daily metrics and inventory. The owner now requests automatic packing receipts in the selected Discord channel.

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
The user supplied 03084555567 as the WhatsApp contact; use international format 923084555567. Store inventory values and operational delivery capacity remain unconfirmed. Database and counter access are configured, and credentials are excluded from source. The owner has authorized automatic receipt delivery to the selected Askari incoming-orders Discord channel. The webhook is a server-only secret; no payment confirmation is available there.

Automatic WhatsApp slips were deferred after Meta required business verification. The user needs packing receipts on both Android and iPhone instead. Staff Web Push alerts open the existing private receipt, including saved product photos and quantities. Each phone must enable notification permission and pass a test; iPhone requires the Home Screen app on iOS 16.4+. Generic push copy excludes customer details. A durable per-device queue and a quiet Supabase Cron retry path keep sending independent of an open browser. Existing customer-initiated WhatsApp links remain available.

Storefront navigation now has separate category, search and product-detail pages. Home shows only available priced products. Original full photographic campaigns and nine round category images are documented in public/images/README.md; exact catalog photos remain authoritative. Staff have no cash-received/Delivered action on any device, including forged API requests. Shared packing slips use compact quantities/unit prices and line totals; PNG downloads support manual phone sharing.
