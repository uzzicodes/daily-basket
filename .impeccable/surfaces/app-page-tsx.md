---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["components/Storefront.tsx"]
---

# Storefront
Visitor mode: Operate. Target: app/page.tsx and components/Storefront.tsx.
The user delegated template selection after seeing the three directions. Quick Basket is selected for the mobile-priority grocery task. This is a code-led build; no image comp is approved.

## Direction contract
THESIS: Products and search lead. The shopper fills a grocery basket immediately, with no large promotional hero interrupting the catalog.
OWN-WORLD: Refined at the user’s request: logo-blue/navy #10283f and #143c56 for action and basket regions, cool-white shelves on #f6f8fb, gold #efc678 for the dark-rail checkout and restrained savings labels. Keep Figtree, Lucide and real packaging. Supporting text retains readable contrast. No decorative eyebrow labels.
STORY: Confirm the delivery area, find familiar brands, adjust quantities, see delivery eligibility and submit an address for COD or WhatsApp. A visible paper-list action supports the customer's existing ritual.
FIRST VIEWPORT: A searchable store header and horizontal departments above a compact welcome. Desktop divides into filter rail, three-column product shelf and basket rail. Mobile keeps two product columns, sticky search and bottom basket summary. The signature interaction turns Add to Basket into a quantity stepper while basket and delivery progress update together.
FORM: Quick Basket, candidate 5 in the grounded surface list. User asked the agent to choose the best design. Seed-reference verification is unavailable in the installed engine: it emitted an eight-character reproducible key, not the required 16-hex reference, and ignored --check-seed. Captured reproduction evidence is work/concept-evidence.txt. No fabricated reference or unavailable-state assertion is recorded.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Motion refinement
Focal feedback: an Add action becomes a blue quantity stepper with a brief warm confirmation, while the count, basket badge and total respond together. Drawers enter and exit along their spatial edge; centered dialogs settle over a dimming navy backdrop. CSS-only bounded transitions (150–350ms), no looping effects or loading choreography. Reduced-motion users retain immediate count/color state without spatial animation. No new dependency.
