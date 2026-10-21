# Daily Basket operations

Daily Basket is the temporary customer brand. Its 3D basket artwork is original. Supplier logos are not shipped; product packaging retains its actual brand. The existing hosting address still has its legacy slug.

## Start the team

1. Open `/owner` (or the compatible `/admin`) using the existing owner password.
2. Open **Team access** and add a named manager, each packer and each rider. Give each person a unique username and password and share it privately.
3. Install the **Daily Basket Team** Android APK from `/apps` on staff phones. Each login opens the person's own role. Customer shopping uses the separate **Daily Basket** APK.
4. The manager uses `/manage`; the packing screen is also available at `/orders`. The owner uses `/owner` for the business overview, costs, inventory and team controls.

Saving an account change revokes its existing sessions. Disabling a departing staff member blocks the next API request. The old shared order-desk password has been retired. Owner passwords do not sign into the Team app.

## An order's path

- New orders reach manager and picker/packer together immediately. No incoming order/bill approval is required.
- The packer starts packing, checks every exact product and quantity and chooses **Order packed**.
- The packer saves an active rider assignment and chooses **Send for delivery**. Dispatch requires completed exact-pack checks and a saved active-rider assignment.
- The assigned rider hands groceries to the customer and chooses **Order delivered**. Packers cannot report delivery.
- Before dispatch, the manager or owner can choose **Item unavailable** or **Cancel order**. Both cancel the entire order with an explicit reason. Item unavailable selects a product from that order and may add an explanation; it does not change catalogue stock, remove one line or affect other orders. The confirmation says **Cancel entire order**; **Keep order** exits.
- Only after Delivered may the manager or owner verify customer delivery, receive the exact bill amount physically, enter it, check the delivery/full-cash attestation and choose **Payment received**. Packers/riders cannot settle cash. Short or extra cash leaves payment open.

Customer tracking has three English/Urdu stages: Order confirmed → Order dispatched → Order delivered. Pending and Packing map to Confirmed; Out for Delivery/Dispatched maps to Dispatched; Delivered maps to Delivered. Cancelled is separate and does not show a completed timeline. AppProvider refreshes all locally saved active orders every 15 seconds while foregrounded and on resume, even outside the order detail. Refresh uses each saved private receipt authorization, coalesces requests by order ID and skips Delivered/Cancelled orders during periodic checks. Order detail retains manual refresh, updated time and visible errors. This is foreground polling, not background push or live rider tracking.

Current hosted migration 20261021221228_packing_dispatch_and_manager_cancellation.sql adds packer rider-assignment/dispatch authority and retains manager/owner-only reasoned cancellation before dispatch. Packer cancellation, delivery and settlement remain forbidden; rider reads/actions remain assignment-bound. Active-rider, staff identity, role, operation_version and audit guards remain. Payment received requires Delivered, payload.delivery_verified=true and cash_received exactly matching the bill. Incoming approve is retired/rejected; the authorized legacy direct Delivered/cash shortcut returns HTTP 409. No real orders, money or global stock were automatically edited by this work.

## Owner figures

Completed sales count delivered orders, including delivery charges. Confirmed cash and delivered cash still with riders are shown separately. Reports use the order placement date and Pakistan time; cash totals refer to those same orders.

In **Orders & bills**, open **Purchase costs & order profit** and enter each actual unit cost and the actual delivery expense. A blank cost is unknown; enter zero only when it is a confirmed zero cost. Optionally save unit costs for future orders. Future cost changes do not rewrite older order snapshots.

Recorded profit is completed sales minus those order costs and recorded operating expenses. It remains unknown if any completed order in the period has missing costs. Enter rent, packaging, utilities and other costs under **Operating expenses**; costs that have not been entered are not deducted. Period choices include Today, 7, 30, 90 days and All time, with a CSV summary export.

Historical completed orders retain their old cash state, without invented approval or handover timestamps. Their purchase costs start unknown.

### Exclude test orders from earnings

In **Business overview**, open **Reset test earnings**. Review **Orders to exclude**, **Completed test sales** and **Already excluded**, then check **I confirm these currently included orders are tests** before choosing **Exclude test orders from earnings**. This includes every currently included order, regardless of the selected report period. If orders change before confirmation, refresh and review the new totals.

Reset excludes that batch from sales, cash totals, profit, charts and order counts in every reporting period. Receipts, customer order history and staff jobs stay available; operating expenses stay unchanged. New orders count normally. **Undo last reset** restores only that reset's batch to reports. Only the owner can reset or undo; both actions are recorded. No actual orders were left excluded during implementation or verification: this is an option for the owner to use after reviewing the live totals.

The hosted verification used a rollback-only transaction to check zeroed order figures, batch restoration and receipt preservation. Snapshot guards and idempotent requests protect concurrent changes/retries. Private database grants/RLS and the owner API enforce access. The applied migration is `20261021164426_report_test_exclusions_and_seven_km_delivery.sql`.

## Delivery coverage

The final owner choice is a **7 km straight-line radius** from the original store pin at **31.41216075, 74.27587375**, 84 Block C2, PGECHS Phase 1, Lahore. This means 7 km in every direction and 14 km across. Road routing was briefly considered and explicitly superseded; driving journeys can be longer. The server and database enforce the same coverage shown by the customer map. App validation uses config.radius_km; native/browser wrappers load the public /delivery-map document, which draws the server-configured circle and fits its bounds. English/Urdu copy states 7 km. Free delivery remains Rs. 2,999 and above, with Rs. 150 below that threshold.

The hosted map document fixes the browser-preview tile-loading defect using the OpenStreetMap main tile URL and a proper document referrer. The native WebView adds the application user-agent identifier and limits navigation to the same route. The initial pin is sent after loading, without customer coordinates in the map URL. The latest 390px browser preview shows loaded tiles; actual phone map behaviour remains unverified.

## Installation and verification limits

Android APKs are signed internal test builds, separate from Play Store publication. Download the correct APK from /apps on the phone, open it and allow installation from that browser if Android requests it. The customer update preserves its application ID and signing key; Team has its own.

Current feature versions are customer 1.0.4 / Android code 5 and Team 1.0.2 / Android code 3. Customer build 1c36143e-b496-4da4-ba18-c7a37bfe25b1 and Team build d21fc79a-b915-4bd2-88c0-004fc9f3295e are FINISHED. The parent downloaded customer outputs/daily-basket-customer-1.0.4.apk (81,658,849 bytes) and Team outputs/daily-basket-team-1.0.2.apk (81,545,961 bytes), verifying ZIP CRC, AndroidManifest, DEX and APK signing-block presence for both. These structural checks do not establish cryptographic signature validation or installed-device behavior. Historical submission checkpoint: both initially returned NEW with artifacts unavailable; this is superseded by the finished/download-verified state. Customer status: https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-shopping/builds/1c36143e-b496-4da4-ba18-c7a37bfe25b1. Team status: https://expo.dev/accounts/daily-basket-lahore/projects/daily-basket-team/builds/d21fc79a-b915-4bd2-88c0-004fc9f3295e. Prior customer 1.0.3/code4 build 3999a36e-8225-4597-bd02-abac055eeb63 and Team 1.0.1/code2 build e301fd88-635f-4328-aec6-6bd581c4aad3 are FINISHED historical artifacts, superseded for this feature and not the latest feature downloads. lib/app-downloads.ts now promotes both verified official Expo artifact URLs, with appBuildPages retaining the exact new IDs. The final website build with both new download URLs passed. Source commit 108e records previous work and is not deployment evidence. Historical connection interruption: Sites transport failed; a later retry restored the connection and refreshed source access. Publication is the next step at this saved-source checkpoint. Native installation/device QA remains unavailable.

The Team app refreshes every ten seconds while open and on resume. Native background push is not configured; keep the app open for live updates. Existing browser staff push is separate. The web /orders Packing desk remains available alongside the finished Team APK.

No Android device/emulator was available. Browser captures from /app-preview and /team-preview are labelled previews. Installation, safe areas, enlarged text, system navigation, sharing, permissions, light/dark appearance and real delivery handling remain unverified on actual phones. EAS internal artifacts currently expire on 4 November 2026; keep downloaded APKs for this test round. Permanent hosting and store distribution remain separate work.

Current hosted migration 20261021221228_packing_dispatch_and_manager_cancellation.sql adds packer rider-assignment/dispatch authority and retains manager/owner-only reasoned cancellation before dispatch. Packer cancellation, delivery and settlement remain forbidden; rider reads/actions remain assignment-bound. Active-rider, staff identity, role, operation_version and audit guards remain. Payment received requires Delivered, payload.delivery_verified=true and cash_received exactly matching the bill. Incoming approve is retired/rejected; the authorized legacy direct Delivered/cash shortcut returns HTTP 409. No real orders, money or global stock were automatically edited by this work.

Parent reports 73/73 tests, root/mobile TypeScript and customer/Team web exports passing. A hosted rollback-only full packer assignment/dispatch → assigned rider delivery → manager payment workflow passed without real order changes; advisors reported INFO private-RLS notices only. One changed-scope detector returned []; metadata scan checked two rasters with zero missing provenance; the seven-file public-export secret scan found no secrets. The reviewer validated nine populated JPEG browser captures with .png suffixes: three-manager-cancel-desktop.png, three-manager-payment-desktop.png, three-manager-cancel-mobile.png, three-manager-payment-mobile.png, three-customer-dispatched-mobile.png, three-customer-delivered-mobile.png, three-packer-packed-mobile.png, three-packer-dispatch-mobile.png and three-rider-delivered-mobile.png. The last five are scoped scrolled action viewports with a browser-preview header. Practice orders/tracking are fictional and live mutations are disabled. These are source/browser checks, not installed Android/iPhone QA.

The supplied existing manager login was repaired through the owner API and verified using native app headers with HTTP 200 and a valid session. One scoped sign-in rate counter was reset; the rate limit remains. No credentials are recorded here. Earlier approval-based workflow/build checkpoints are historical and superseded by this current order path and handoff.

## Password controls

In Team access, each staff row has **Change password**. Only the owner can set a new password for any staff account they create or add; a confirmation field prevents typing mismatches. Saving revokes the staff member’s old sessions. Account security separately changes the owner password using the current owner password.

Owner recovery is restricted to `uzair.business.2003@gmail.com`; phone recovery is disabled. The user deferred the Resend sender connection on 21 October 2026. Reset-email delivery therefore remains disabled with an explicit setup-pending message. No provider key was saved and no recovery email was sent. When connected later, links use a 256-bit secret, a 15-minute expiry and single-use database verification; only its hash is stored. Password changes invalidate previous owner session versions.
