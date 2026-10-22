---
version: 1
slug: operations
primary_target: components/OperationsPortal.tsx
related_targets: [components/OwnerWorkspace.tsx, mobile/TeamApp.tsx, app/operations.css]
---
# Daily Basket operations

Mode: Operate. Web manager/owner panels and Android packer/rider app.

THESIS: Give each person one clear job with server-enforced authority and audit. This is a bounded refinement of the incumbent Everyday Market world.

OWN-WORLD: Preserve deep teal navigation, warm white work surfaces, Poppins web/system native typography, exact pack photographs and original 3D teal basket artwork. Operations stay light; Team follows system light/dark. No new tokens or identity.

## Current source workflow — 22 October 2026

New orders reach manager and packer immediately with no incoming order/bill approval. The packer checks every exact product and quantity and presses **Packed** directly. There is no Start packing, rider assignment or dispatch action for the packer. Packed unassigned orders automatically appear to riders. **Pick up order** atomically claims and dispatches an order; competing pickups cannot both succeed. Only the assigned rider presses **Delivered** after actual customer delivery. The manager uses **Item unavailable** or **Cancel order** with a reason before dispatch; item-unavailable cancels the whole order without changing global stock or other orders. **Payment received from rider** requires Delivered, explicit `delivery_verified=true` and physically returned cash exactly equal to the bill. Short/extra cash leaves payment open. Delivery and `cash_confirmed` remain separate. Owner overrides remain internal administration controls. Packers/riders cannot cancel or settle; packers cannot claim or deliver.

FIRST VIEWPORT: Preserve role/name navigation, queue and exact photo/quantity detail. Packers see checks and Packed; riders see ready orders with Pick up order and their dispatched orders with Delivered. The manager sees reasoned cancellation and the delivered-order exact-cash form. Phone detail retains Back to queue.

FORM: Existing workbench, labelled fields, explicit state words, tonal notices and primary/secondary actions. /orders is packer access, /manage manager access, /owner owner access with /admin compatibility. Team directs managers to the web workspace. Team supports English/Urdu, private receipt PDFs and ten-second foreground/resume refresh; native background push remains unconfigured.

SYSTEM: Retain scoped --ops-* roles, 238px desktop sidebar and flat border/tonal depth. At 1000px navigation becomes a header; at 720px detail replaces the queue. Team retains native system type, 14-unit actions and 16-unit cards. DESIGN.md and .impeccable/design.json remain unchanged; their earlier behavioral prose does not override this workflow.

## Account diagnosis and password controls

All three real staff accounts are active with valid salted hashes. The earlier user-supplied password matched none; no real staff passwords changed. Failed staff sign-ins now use separate counters per normalized username and credential version, plus a 40-attempt per-IP network cap. Success clears the account counter. Owner staff-password reset creates a new credential version, unlocks that credential and revokes older sessions. Team has Show password. Owner Team access requires confirmation whenever supplying a new password, including creation/reset.

Temporary packer, rider and manager accounts verified owner create/reset, old-password rejection, old-session revocation, new-password acceptance, preserved role and revocation on disable. Cleanup is complete; no customer orders changed. Preview identities are fictional and cannot save.

Owner Account security separately requires current password and a confirmed replacement of at least twelve characters, retains this browser through a replacement session and revokes older sessions. Email-only recovery uses a fifteen-minute single-use fragment token stored as a hash; phone recovery is disabled. Resend/email setup remains deferred: no sender key saved or recovery email sent; requests remain disabled until setup/live-send verification. No real owner password changed.

## Finance and coverage

Owner-only cost snapshots, expenses and profit remain private. Missing purchase/delivery costs leave profit unknown; zero must be confirmed. Only entered expenses are deducted. Reports use order-placement date in Asia/Karachi; cash totals describe that cohort.

Reset test earnings starts closed, requires count/sales review and explicit test-order confirmation, and uses snapshot/idempotency guards plus private audited tables. It excludes current orders from reports while retaining receipts/history/jobs and expenses. New orders count normally; Undo last reset restores its batch. Prior rollback-only verification left no actual orders excluded.

Coverage remains 7 km straight-line in every direction from the original store pin, 14 km across; road routing was superseded. Checkout/database checks and /delivery-map agree; native validation uses config.radius_km. COD fees/threshold remain.

## Release checkpoint and gates

Customer 1.0.4/code 5 is unchanged. [Build 1c36143e-b496-4da4-ba18-c7a37bfe25b1](https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-shopping/builds/1c36143e-b496-4da4-ba18-c7a37bfe25b1) is FINISHED; downloaded APK checks cover ZIP CRC, manifest, DEX and signing-block presence, not cryptographic signature validation or installed-device behavior.

Team source is 1.0.3/code 4. [Build 776e6432-bd55-4d08-a3cb-15344ca21090](https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-team/builds/776e6432-bd55-4d08-a3cb-15344ca21090) is FINISHED. The downloaded `outputs/daily-basket-team-1.0.3.apk` is 81,544,917 bytes and passed ZIP CRC, AndroidManifest, DEX and APK signing-block presence checks. Its SHA-256 is `4a5bcb1604797741c27116f83c937b7a4b7ace79c330130a697f30ab45418c95`. These checks do not establish cryptographic signature validation or installed-device behavior. EAS source upload/fingerprinting succeeded. The APK source upload predates only the subsequent Team browser checkbox ARIA/neutral-label amendment; native behavior is unchanged, but this APK is not claimed to match the exact current source tree. No source commit is claimed for this APK. Local staging commit `fd8d20b` was created after submission and is only a local record. Finished [Team 1.0.2/code 3 build d21fc79a-b915-4bd2-88c0-004fc9f3295e](https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-team/builds/d21fc79a-b915-4bd2-88c0-004fc9f3295e) is historical and contains the prior assignment/dispatch workflow.

Parent reports 75/75 tests and passing root/mobile TypeScript. Hosted PostgREST rider queries passed active/completed/all/cash views, cursors and scope enforcement. The local `20261021225925_packed_orders_automatic_rider_pickup.sql` migration is applied and recorded in hosted history as version `20261021233048`, name `packed_orders_automatic_rider_pickup`. A hosted rollback-only synthetic Packed → atomic rider pickup → Delivered → manager exact-cash test passed, including second-rider claim denial, payment-before-delivery denial and four audit actions. The transaction rolled back; no real customer orders changed. Function ACL checks deny anon/authenticated and permit service authority. Security advisors report INFO private-RLS/no-policy notices on eighteen deliberately server-only private tables.

Capture tooling recovered after the earlier os error 3 failures; all twelve current captures are valid. The earlier `pickup-reviewer.md` recapture report is historical. A fresh review requested only the Team browser exact-pack checkbox ARIA checked state and neutral action label. That web-only amendment is implemented with a Platform.OS==='web' mapping; native accessibilityState and labels are unchanged. Team browser preview was re-exported and mobile TypeScript passed. Provenance scan checked one raster with zero missing records; the three-file public secret scan was clean. The final .impeccable/review/pickup-verdict.md disposition is ship for the sole scored fix at source/browser-preview scope. The reviewer checked corrected source and checked/unchecked captures; the parent-provided DOM cycle verified false → true → false, and the final snapshot exposed both checks as checked. Website publication and deployed smoke checks are outside that verdict. Existing `three-*.png` images still show the previous workflow. Native installed-device QA remains open: verify dark appearance, enlarged text, keyboard, safe areas, Back and role denial.

Publication is pending in this source snapshot. Version 23 at commit `64cf021…` was the prior 23:29 UTC checkpoint, not a claim about every later live state. The parent will build the updated browser preview, push/save source, deploy and record the final deployment receipt in `outputs/pickup-release-receipt.json`. Read that receipt for the final live version and post-deployment evidence. Do not claim completed publication from this checkpoint.
