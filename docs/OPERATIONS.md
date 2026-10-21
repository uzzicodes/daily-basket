# Daily Basket operations

Daily Basket is the temporary customer brand. Its 3D basket artwork is original. Supplier logos are not shipped; product packaging retains its actual brand. The existing hosting address still has its legacy slug.

## Start the team

1. Open `/owner` (or the compatible `/admin`) using the existing owner password.
2. Open **Team access** and add a named manager, each packer and each rider. Give each person a unique username and password and share it privately.
3. Install the **Daily Basket Team** Android APK from `/apps` on staff phones. Each login opens the person's own role. Customer shopping uses the separate **Daily Basket** APK.
4. The manager uses `/manage`; the packing screen is also available at `/orders`. The owner uses `/owner` for the business overview, costs, inventory and team controls.

Saving an account change revokes its existing sessions. Disabling a departing staff member blocks the next API request. The old shared order-desk password has been retired. Owner passwords do not sign into the Team app.

## An order's path

- A new order appears immediately for both manager and picker/packer. The manager reviews exact products, quantities, delivery address and the bill while picking proceeds.
- The picker can start a Pending order before approval, check each exact product and quantity, and mark packing ready. The packing receipt includes product photos. The manager may approve or reject while the order is Pending or Packing; rejection requires a reason.
- The manager assigns an active rider after approval. Dispatch requires approval, completed packing and an assigned rider.
- That rider sees only assigned orders, opens the delivery map, calls the customer if needed and confirms grocery delivery.
- The manager receives the cash physically, enters the exact bill amount and confirms the handover. This closes payment. The owner can also settle cash.

Packers and riders cannot confirm store cash. Delivery confirmation and cash confirmation are separate. Short or extra payments stay open for review; they cannot be silently recorded as the exact bill. Concurrent/stale actions are rejected and every successful state action is audited.

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

Android APKs are signed internal test builds, separate from Play Store publication. Download the correct APK on the phone, open it, and allow installation from that browser if Android requests it. The customer update uses the existing application ID and signing key; Team has its own application ID and signing key.

The Team app refreshes while open every ten seconds and on resume. Background native push is not configured; keep the app open for live updates. Existing web phone-alert setup remains a separate channel. Android/iPhone screenshots from `/app-preview` and `/team-preview` are browser previews, not physical-device tests. No Android device/emulator was available during this build. Check installation, enlarged text, system navigation, sharing, permissions and real delivery handling on actual staff phones before operational rollout.

EAS internal artifacts currently have a 4 November 2026 expiry. Keep the downloaded APKs for this test round; the `/apps` hub is the stable place to find the current builds. Store distribution and permanent download hosting are separate release work.

At this documentation pass, replacement customer **1.0.3 / Android code 4** build `3999a36e-8225-4597-bd02-abac055eeb63` and Team **1.0.1 / Android code 2** build `9833f54e-9cb4-4773-aa33-915b07b6634e` are submitted/pending. Their finished APKs and updated download handoff are not yet verified. Earlier queued customer build `633ca7d1-7413-40ce-ac09-322535f3877f` was canceled before completion to include the map fix. The previous customer 1.0.2/code3 and Team 1.0.0/code1 artifacts were verified. Consult `/apps` for current queue/status links; current APK download values are empty until verified.

The supplied existing manager login was repaired through the owner API and verified using native app headers with HTTP 200 and a valid session. One scoped sign-in rate counter was reset for the check; the rate limit remains. Passwords are shared privately and are not recorded in these instructions.

The reset/radius work passed 70 tests, root/mobile TypeScript and exports according to the implementation checks. Seven further targeted workflow tests passed for pending picking, approval during Packing, dispatch approval and role/version guards; migration 20261021170742 is applied to the hosted database. These source/backend checks changed no actual customer orders. Browser review captures show owner reset at desktop and 390px, a 7.10 km pin rejected at desktop, a 6.90 km pin accepted at 390px and corrected app map tiles at 390px. These support source/browser scope only; actual phone installation and native UX remain unverified.

The full 70-test suite passed again after final workflow/copy reconciliation, including pending packing before bill review, private API filters and rider/cash guards. Current browser captures show Pending orders with Start packing in the fictional desktop/phone picker preview, parallel guidance in Team and corrected app map tiles without 403 errors. English/Urdu Team empty states both describe immediate new-order delivery. Intermediate Team c26f23c8-5920-4099-95ca-7da02d7025c0 and a subsequent intermediate attempt were canceled; the pending Team build listed above is the intended replacement. Fresh finish review remains in progress and neither new APK is download-verified yet.

A read-only HTTP check using the existing manager and packer accounts confirmed that both queues show the same two new unreviewed orders, with no financial fields. No customer orders changed; root TypeScript and all 70 tests pass. This check used the local server and does not establish native installation or phone UX.

Both replacement builds are currently IN_QUEUE. The current customer/Team APK values in lib/app-downloads.ts are intentionally empty; /apps shows queue messages and the exact current build-status links. Historical customer 1.0.2/Team 1.0.0 APKs are not advertised as current. Use **Packing desk** on /apps or open /orders while Team builds. Website publication is the next step so staff can receive new orders immediately; APK publication waits for finished-build verification. The new hub fallback captures remain under review, and this record does not claim that publication has completed.

## Password controls

In Team access, each staff row has **Change password**. Only the owner can set a new password for any staff account they create or add; a confirmation field prevents typing mismatches. Saving revokes the staff member’s old sessions. Account security separately changes the owner password using the current owner password.

Owner recovery is restricted to `uzair.business.2003@gmail.com`; phone recovery is disabled. The user deferred the Resend sender connection on 21 October 2026. Reset-email delivery therefore remains disabled with an explicit setup-pending message. No provider key was saved and no recovery email was sent. When connected later, links use a 256-bit secret, a 15-minute expiry and single-use database verification; only its hash is stored. Password changes invalidate previous owner session versions.
