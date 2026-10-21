# Daily Basket operations

Daily Basket is the temporary customer brand. Its 3D basket artwork is original. Supplier logos are not shipped; product packaging retains its actual brand. The existing hosting address still has its legacy slug.

## Start the team

1. Open `/owner` (or the compatible `/admin`) using the existing owner password.
2. Open **Team access** and add a named manager, each packer and each rider. Give each person a unique username and password and share it privately.
3. Install the **Daily Basket Team** Android APK from `/apps` on staff phones. Each login opens the person's own role. Customer shopping uses the separate **Daily Basket** APK.
4. The manager uses `/manage`; the packing screen is also available at `/orders`. The owner uses `/owner` for the business overview, costs, inventory and team controls.

Saving an account change revokes its existing sessions. Disabling a departing staff member blocks the next API request. The old shared order-desk password has been retired. Owner passwords do not sign into the Team app.

## An order's path

- New orders appear for manager and picker/packer together immediately. No incoming order or bill approval is required.
- The picker starts Pending orders, checks each exact product and quantity and marks packing ready. Product photos remain on the packing receipt.
- The manager assigns an active rider. Dispatch requires checked packing and an assigned active rider.
- The assigned rider delivers the groceries and reports Delivered. This report does not confirm cash returned to the store.
- After Delivered is reported, the manager or owner verifies customer delivery, receives the exact bill amount physically, enters it and checks the delivery/full-cash attestation before choosing Verify delivery & close bill.

Packers and riders cannot settle store cash. Cash cannot be settled before Delivered. Short or extra cash keeps the bill open. Version/role/identity guards reject stale or unauthorized changes and successful actions are audited. Legacy internal cancellation with a reason remains available to authorized management; incoming approve is retired. The legacy direct Delivered/cash shortcut rejects the request instead of bypassing final verification. Existing orders and money are not automatically changed.

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

Customer 1.0.3 / Android code 4 build 3999a36e-8225-4597-bd02-abac055eeb63 is FINISHED. The parent downloaded its 81,654,449-byte APK to outputs/daily-basket-customer-1.0.3.apk and verified ZIP CRC, AndroidManifest, DEX and APK signing-block presence. Its current download is promoted in lib/app-downloads.ts. Final Team 1.0.1 / Android code 2 build e301fd88-635f-4328-aec6-6bd581c4aad3 is submitted/pending; its APK is not ready or download-verified. Team build 9833f54e-9cb4-4773-aa33-915b07b6634e was canceled as superseded. /apps shows the current customer download, exact Team build-status link and web Packing desk fallback. Neither build evidence nor browser captures establish native installation or phone UX. Website publication is the next handoff; no completed publication is claimed here.

The Team app refreshes every ten seconds while open and on resume. Native background push is not configured; keep the app open for live updates. Existing browser staff push is separate. Use /orders or Packing desk on /apps while the replacement Team APK is pending.

No Android device/emulator was available. Browser captures from /app-preview and /team-preview are labelled previews. Installation, safe areas, enlarged text, system navigation, sharing, permissions, light/dark appearance and real delivery handling remain unverified on actual phones. EAS internal artifacts currently expire on 4 November 2026; keep downloaded APKs for this test round. Permanent hosting and store distribution remain separate work.

Hosted migration 20261021175134_delivery_before_final_cash_verification.sql requires Delivered, payload.delivery_verified=true and cash_received exactly equal to the bill for settlement. Active-staff identity, role, assigned-rider and operation_version guards remain enforced; successful actions record the actor in the audit trail. Incoming approve is absent from the API action schema and rejected by the SQL RPC. The legacy Delivered/cash shortcut returns HTTP 409 for authorized requests; unauthorized requests remain denied. Legacy internal cancellation with a reason is retained. This change does not automatically edit existing orders or money.

The parent reports 70/70 tests, root and mobile TypeScript, Team web export and a complete rollback-only hosted workflow check passing, without changing real orders or money. Hosted advisors reported INFO private-RLS notices only. The final changed-scope detector returned []. The reviewer inspected six valid populated JPEG captures with .png suffixes: final-manager-new-desktop.png, final-manager-delivery-desktop.png, final-manager-verify-desktop.png, final-manager-delivery-mobile.png, final-manager-verify-mobile.png and final-team-packer-mobile.png. final-apps-desktop.png and final-apps-mobile.png show the customer download and Team queue fallback. These establish source/browser and build-artifact evidence only; no native-device QA is claimed.

The supplied existing manager login was repaired through the owner API and verified using native app headers with HTTP 200 and a valid session. One scoped sign-in rate counter was reset; the rate limit remains. No credentials are recorded here. Earlier approval-based workflow/build checkpoints are historical and superseded by this current order path and handoff.

## Password controls

In Team access, each staff row has **Change password**. Only the owner can set a new password for any staff account they create or add; a confirmation field prevents typing mismatches. Saving revokes the staff member’s old sessions. Account security separately changes the owner password using the current owner password.

Owner recovery is restricted to `uzair.business.2003@gmail.com`; phone recovery is disabled. The user deferred the Resend sender connection on 21 October 2026. Reset-email delivery therefore remains disabled with an explicit setup-pending message. No provider key was saved and no recovery email was sent. When connected later, links use a 256-bit secret, a 15-minute expiry and single-use database verification; only its hash is stored. Password changes invalidate previous owner session versions.
