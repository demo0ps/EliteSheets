# Project status

Updated: 2026-10-13

## Goal and latest owner decisions

SheetQMS spreadsheet transformation, now targeting an internet/serverless multi-customer product (`sheetqms-cloud/`, v0.2.0) while keeping the earlier local prototype (`sheetqms-app/`, v0.1.0) as a rollback reference.

Confirmed 2026-10-13:
- Separate customer accounts; files, QMS conversations and knowledge isolated per customer.
- Private cloud job history with deletion.
- Users may edit permitted non-secret preferences; shared AI credentials, models and budgets belong to the **platform admin (owner only)**.
- Budget amounts are created in the admin dashboard. Initial allowances are **USD 0**, AI disabled.
- External AI processing remains permitted; conflicts hold; passing QMS auto-releases and saves scoped knowledge.
- Minimal, conversational UI (`D-025`) & direct client spreadsheet edits in chat (`D-026`): single centered sign-in card, clean top navigation bar (no sidebar clutter), and a simple two-panel workspace (**QMS Assistant** on the left with short plain-English chat bubbles and 1-click reply buttons, **Your Output Spreadsheet** on the right with `Download XLSX` and technical details collapsed out of sight). Directly executes client requests in chat (`"swap Jan and Feb"`, `"swap"`, `"replace the first row with row 2"`, cell updates, sorting, adding/deleting rows, column math) on the spreadsheet and `.xlsx` download.

## Current phase

**v0.2 online workspace + minimal conversational QMS UI built and verified against development adapters; live cloud deployment and production acceptance remain OPEN.**

Implemented in `sheetqms-cloud/`:
- Minimal conversational workspace UI (QMS Assistant chat + live Output Spreadsheet preview, History, Saved Rules, Preferences, Admin Settings).
- Customer auth, salted scrypt passwords, server-side sessions, CSRF protection and workspace isolation.
- Guided QMS chat & direct client spreadsheet edits: explains issues, offers 1-click quick-fix replies and typed text input, turns supported replies into explicit confirmable proposals, executes direct client spreadsheet edit commands (row/column swaps, cell updates, sorting, renaming, row additions/deletions) with `.xlsx` regeneration and `Total` recalculation, records operator-supplied facts as new audited sources without changing originals, reruns deterministic QMS and releases only when checks pass.
- Admin control plane: create customer accounts, create platform/AI budgets, configure write-only encrypted shared API keys and per-customer storage/job quotas.
- Stateless scratch processing, database-backed job leases, durable rate limits, PostgreSQL/R2 production adapters and a Cloud Run container recipe (`deploy/Dockerfile`, `sheetqms/migrate.py`).

## Executed verification — v0.2 (`sheetqms-cloud/`)

- Full pytest: **67 passed, 1 test-client deprecation warning**, exit 0. Evidence: `sheetqms-cloud/verification/automated-tests.txt`.
- Strict TypeScript ES2021 build: passed (`web/app.js`).
- Headless Chromium workflows: **22 passed** across **1280px and 390px**. Exercised sign-in, operator studio, held workbook chat explanation, text reply (`North Feb is 18`), proposal confirmation, QMS rerun/release, direct client spreadsheet edits (`swap Jan and Feb`, `replace the first row with row 2`), XLSX download, customer knowledge, dark/light/compact preferences, keyboard modal trap/Escape, mobile logout, and admin budget creation. Evidence: `sheetqms-cloud/verification/browser-checks.json`.
- Axe WCAG 2/2.1 A/AA tags: **0 violations across 16 scanned states** (including dark and light preference themes); **0 console errors**; **0 external page requests**. Not a full manual accessibility certification.
- Screenshots inspected: `login-1280.png`, `studio-1280.png`, `held-chat-1280.png`, `admin-1280.png`, `held-chat-390.png` and `studio-390.png` viewed directly.
- Prior v0.1 local prototype evidence (`sheetqms-app/`, 73 pytest + 22 browser checks) remains intact for that artifact only and is not relabelled as v0.2 proof.

## Running development preview & published GitHub Pages preview

- **Live Public Preview (GitHub Pages):** `https://demo0ps.github.io/SheetQMS/` (GitHub Pages build `1281526803`, `status: built`, commit `5c42f14cbc7b55e9b33740053c40ac38a7e6a295`). Verified in headless Chromium at `1280x840` and `390x844` (`live-pages-1280.png`, `live-pages-390.png`) with 0 console/page errors and `openpyxl`-verified `.xlsx` download. Runs in client-side browser preview mode (`localStorage` + browser `.xlsx` builder).
- **GitHub Repository:** `https://github.com/demo0ps/SheetQMS` (`main` branch, 51 files, zero secrets/DBs committed).
- **Arena Sandbox FastAPI Preview:** `SheetQMS online workspace` is running on port **3001**, managed process `sheetqms-online-workspace-0cd010f9` (`SHEETQMS_DEMO=1`). Local `/health` and preview host checks returned HTTP 200. It uses synthetic demo data and development SQLite/local-object adapters; real API keys and live AI calls are refused.

## Known gaps / blockers before production

1. **Not deployed to the public internet yet:** no owner cloud account, PostgreSQL URL, R2 bucket, stable encryption key or domain has been supplied.
2. Live PostgreSQL/R2 integration, cold starts, real-phone/browser checks, live AI provider calls/pricing/terms and real business spreadsheets remain unverified.
3. Guided chat handles specific supported corrections and explanations; broad free-form interpretation requires an admin-configured, budgeted, consented AI provider.
4. Invite-only customer creation is implemented; public self-signup, email delivery/password reset and independent security review are not implemented.
5. Job deletion removes stored blobs, job state and chat history while retaining minimal append-only audit and QMS-passed structural knowledge.
6. Dashboard budget amounts are app-enforced allowances/planning values, not provider-enforced cloud billing caps.

## Next / handoff

Owner: review `SheetQMS online workspace` on port 3001 and `SheetQMS-online.zip`. When ready to publish online, provision PostgreSQL + private R2 + Cloud Run (or provide your target cloud account workflow out of band), set secrets in the cloud secret manager, run `python -m sheetqms.migrate`, and run the live-URL verification checklist in `docs/DEPLOY.md`.
