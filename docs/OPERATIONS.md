# Daily Basket operations

Daily Basket is the temporary customer brand. Its 3D basket artwork is original. Supplier logos are not shipped; product packaging retains its actual brand. The existing hosting address still has its legacy slug.

## Start the team

1. Open `/owner` (or the compatible `/admin`) using the existing owner password.
2. Open **Team access** and add a named manager, each packer and each rider. Give each person a unique username and password and share it privately.
3. Install the **Daily Basket Team** Android APK from `/apps` on staff phones. Each login opens the person's own role. Customer shopping uses the separate **Daily Basket** APK.
4. The manager uses `/manage`; the packing screen is also available at `/orders`. The owner uses `/owner` for the business overview, costs, inventory and team controls.

Saving an account change revokes its existing sessions. Disabling a departing staff member blocks the next API request. The old shared order-desk password has been retired. Owner passwords do not sign into the Team app.

## An order's path

- The manager reviews exact products, quantities, delivery address and the bill, then approves or rejects the order. A rejection requires a reason.
- A packer starts an approved order, checks each exact product and quantity, and marks it ready. The packing receipt includes product photos.
- The manager assigns an active rider. Dispatch requires completed packing and an assigned rider.
- That rider sees only assigned orders, opens the delivery map, calls the customer if needed and confirms grocery delivery.
- The manager receives the cash physically, enters the exact bill amount and confirms the handover. This closes payment. The owner can also settle cash.

Packers and riders cannot confirm store cash. Delivery confirmation and cash confirmation are separate. Short or extra payments stay open for review; they cannot be silently recorded as the exact bill. Concurrent/stale actions are rejected and every successful state action is audited.

## Owner figures

Completed sales count delivered orders, including delivery charges. Confirmed cash and delivered cash still with riders are shown separately. Reports use the order placement date and Pakistan time; cash totals refer to those same orders.

In **Orders & bills**, open **Purchase costs & order profit** and enter each actual unit cost and the actual delivery expense. A blank cost is unknown; enter zero only when it is a confirmed zero cost. Optionally save unit costs for future orders. Future cost changes do not rewrite older order snapshots.

Recorded profit is completed sales minus those order costs and recorded operating expenses. It remains unknown if any completed order in the period has missing costs. Enter rent, packaging, utilities and other costs under **Operating expenses**; costs that have not been entered are not deducted. Period choices include Today, 7, 30, 90 days and All time, with a CSV summary export.

Historical completed orders retain their old cash state, without invented approval or handover timestamps. Their purchase costs start unknown.

## Installation and verification limits

Android APKs are signed internal test builds, separate from Play Store publication. Download the correct APK on the phone, open it, and allow installation from that browser if Android requests it. The customer update uses the existing application ID and signing key; Team has its own application ID and signing key.

The Team app refreshes while open every ten seconds and on resume. Background native push is not configured; keep the app open for live updates. Existing web phone-alert setup remains a separate channel. Android/iPhone screenshots from `/app-preview` and `/team-preview` are browser previews, not physical-device tests. No Android device/emulator was available during this build. Check installation, enlarged text, system navigation, sharing, permissions and real delivery handling on actual staff phones before operational rollout.

EAS internal artifacts currently have a 4 November 2026 expiry. Keep the downloaded APKs for this test round; the `/apps` hub is the stable place to find the current builds. Store distribution and permanent download hosting are separate release work.

## Password controls

In Team access, each staff row has **Change password**. Only the owner can set a new password for any staff account they create or add; a confirmation field prevents typing mismatches. Saving revokes the staff member’s old sessions. Account security separately changes the owner password using the current owner password.

Owner recovery is restricted to `uzair.business.2003@gmail.com`; phone recovery is disabled. The user deferred the Resend sender connection on 21 October 2026. Reset-email delivery therefore remains disabled with an explicit setup-pending message. No provider key was saved and no recovery email was sent. When connected later, links use a 256-bit secret, a 15-minute expiry and single-use database verification; only its hash is stored. Password changes invalidate previous owner session versions.
