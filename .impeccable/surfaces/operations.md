---
version: 1
slug: operations
primary_target: components/OperationsPortal.tsx
related_targets: [components/OwnerWorkspace.tsx, mobile/TeamApp.tsx, app/operations.css]
---
# Daily Basket operations

Mode: Operate. Web manager/owner panels and Android packer/rider app.

THESIS: Give each person one clear job, with server-enforced authority and an audit trail. The owner confirmed manager cash settlement on 21 October 2026; packers/riders never settle store cash.

OWN-WORLD: Extend Everyday Market with deep teal navigation, warm white work surfaces, precise Poppins web/system native type, exact product photographs and an original 3D teal basket brand mark. No supplier artwork or supplier-facing customer name.

STORY: A customer orders; the manager checks the bill and approves; the packer checks every exact pack; an assigned rider delivers; the manager records the exact returned cash; the owner sees revenue, costs and profit coverage.

FIRST VIEWPORT: Role/name navigation, a clear current queue and selected order with photo/quantity lines. Manager adds bill approval, assignment and cash reconciliation. Owner opens a period-filtered business overview and keeps team, inventory and purchase costs one step away. Native staff views prioritize their next job and one state action.

FORM: An extension of the approved Everyday Market world. Keep the familiar operational layout and current stock/checkout infrastructure. No replacement visual-world roll; the new 3D logo is explicitly requested. seed: none (incumbent extension).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

QUALITY BAR: No cross-role access to owner accounts/profit, no rider settlement, no guessed profit, no silent cash discrepancies or duplicate state transitions. Manager and owner use web; packers/riders use one separately identified Android staff app with individual roles. Native device verification remains separate from browser preview and signed APK build checks.

## Documented implementation — 21 October 2026

AUTHORITY: The owner creates individual staff usernames/passwords and chooses packer, rider or manager. The shared desk password is retired; owner credentials remain separate. Packers see manager-approved orders and check exact packs/quantities; riders see assigned deliveries. Managers approve bills, assign riders and can receive the exact rider cash and close payment. Owner can also settle. Packers/riders cannot settle. Delivered records actual delivery; cash_confirmed is the separate store settlement state. State changes and cash confirmation identify the staff actor and use server version checks.

FINANCE: Owner-only purchase unit costs, delivery costs, operating expenses, sales and profit. Order snapshots freeze costs; future cost changes do not rewrite old orders. Missing costs leave profit unknown; zero is a confirmed actual zero. Only entered expenses are deducted. Periods group orders by placement date in Asia/Karachi; cash figures relate to that cohort rather than a receipt-date ledger. UI explains coverage and provides exact chart values in a table.

SURFACES: /manage is the manager web workspace, /owner the owner workspace and /admin its legacy compatibility route; /orders retains individual packer web access. /apps separates customer and Team Android downloads, labelled browser previews and web workspace links. Team is one separately identified app with per-account packer/rider views; manager accounts are directed to the web panel. Team supports private receipt PDFs and foreground refresh every 10 seconds plus resume. Native background push is not configured: keep-app-open copy is explicit. Existing browser staff push is separate.

SYSTEM: Operations are intentionally light and use Poppins, scoped --ops-* teal/deep/ink/muted/line/soft/paper properties and operations-* documented tokens. 238px desktop sidebar, queue/detail workbench, border/tonal depth and explicit state labels extend Everyday Market. At 1000px navigation becomes a header; at 720px selected detail replaces the queue with a Back action. Team inherits native system typography, system light/dark roles, 14-unit actions and 16-unit job cards. Do not restyle unrelated incumbent web/native scopes.

IDENTITY: Original 3D teal basket, independently generated without supplier artwork, replaces the flat generic icon. Sources: public/brand/daily-basket-mark-v2.png, daily-basket-app-icon-v2.png and optimized daily-basket-mark-192.png; mobile/assets/brand-mark-144.png and app-icon-1024-v2.png. All carry adjacent .png.json provenance and embedded PNG prompt metadata; mobile/assets/README.md records derivative lineage. No supplier logo ships. Product photos/brands remain factual. The legacy deployment URL retains the Askari slug because the metadata tool cannot rename it; customer title/UI uses Daily Basket and compatibility cookies/storage remain.

BUILD/HANDOFF: Customer 1.0.2/code3 signed EAS build 266afa8a-853a-4fad-9862-f809fcd0d4c7 is finished; the verified APK is sourced from lib/app-downloads.ts. Team 1.0.0/code1 uses project 08a1661d-69fc-4f99-af37-b82e17b16762; signed build 19ecf595-9678-4bad-9064-b58d1385d6a7 is finished. Both APKs were downloaded and passed ZIP/signing-block structural checks. lib/app-downloads.ts contains both verified URLs, /apps exposes them and final apps-desktop/apps-mobile captures match. docs/OPERATIONS.md records installation and role handoff. No installed-native QA is claimed. The original documentation/final-link fixes are completed; final reviewer disposition remains separate.

REVIEW EVIDENCE: .impeccable/review/operations-reviewer.md disposition fix requires documentation reconciliation and final two-APK handoff only; its incumbent visual ceiling was reached and no material restyling was owed. operations-detector.md records the single changed-web detector pass: tonal-palette/compact-radius advisories only, no absolute-ban finding; native detector skipped. Current captures in .impeccable/review/: operations-desktop.png, operations-mobile.png, packing-desktop.png, packing-mobile.png, owner-desktop.png, owner-mobile.png, apps-desktop.png, apps-mobile.png, customer-web-phone.png, team-packer-web-phone.png, team-packer-actions-web-phone.png, team-rider-web-phone.png and team-rider-actions-web-phone.png. The final apps captures show both verified download links. All customer/Team phone views are browser previews. No Android SDK, device/emulator, permissions, system bars/insets, enlarged text, Back/gestures, native dark/light rendering or performance verification is claimed; signing alone does not establish native UX.

## Owner account security and recovery

SURFACE: Owner navigation adds Account security. The existing login adds Forgot owner password? linking to /owner/recover. Authenticated change requires the current password, a new password of at least 12 characters and confirmation; it retains this browser through a replacement owner session and invalidates older owner sessions. Staff credentials stay separate. Recovery is EMAIL ONLY to uzair.business.2003@gmail.com; phone recovery is disabled.

SECURITY: /api/admin/password requires owner authority plus current password. /api/admin/recovery request/reset uses a server-fixed email, server-only Resend key, 256-bit fragment token with only SHA-256 stored, 15-minute expiry/single-use and global/IP limits. Atomic password replacement invalidates older owner authentication versions and consumes the reset. The page clears its URL fragment after reading it. Hosted migration 20261021114407 is applied and local tests passed; no real owner password was changed in tests.

DELIVERY STATUS: The user explicitly deferred Resend/email setup until later. No sending key is saved and no email has been sent. Email recovery requests remain disabled until the user resumes setup and live-send verification completes. Unconfigured UI explains setup pending and disables sending; signed-in password change remains available. Recovery request/reset and success states are implementation states, not evidence of a delivered message.

EVIDENCE: owner-security-desktop.png, owner-security-mobile.png and owner-recovery-desktop.png exist in .impeccable/review/. Phone recovery capture was pending at this documentation pass. These remain browser evidence. Final security/recovery review and live email verification are tracked separately from the completed signed APK handoff.

## Owner resets of staff passwords

CONTROL: Team access provides a dedicated Change password action on every created manager/packer/rider row, separate from Edit access. The password-only form requires the replacement and confirmation and shows a success notice. The owner-only existing team API hashes the replacement password and increments auth_version, revoking prior sessions while preserving role/access. The owner's own password still changes through Account security with the current owner password.

PREVIEW: Team access is available in the owner layout preview using three clearly fictional practice manager, packer and rider fixtures. Password actions can be inspected; inputs/submission are disabled in preview and the save handler exits before any API call. No fictional identity is represented as a live employee.

VERIFICATION: Parent's live HTTP integration check created a temporary packer and reset through the owner API. It proved old-password rejection, revocation of the old bearer session, new-password acceptance, role preservation and revocation when disabled. The temporary account was removed; no customer orders or real owner password changed. No email setup resumes without a new user instruction; email recovery remains pending/disabled and phone recovery stays disabled.
