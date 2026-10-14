# Project status

Updated: 2026-10-14

## Goal and latest owner decisions

SheetQMS spreadsheet transformation, creation, Business PA, and vertical-tailored spreadsheet assistant (`sheetqms-cloud/`, v0.2.0) while keeping the earlier local prototype (`sheetqms-app/`, v0.1.0) as a rollback reference.

Confirmed 2026-10-13 to 2026-10-14:
- Separate customer accounts; files, conversations and knowledge isolated per customer.
- Private cloud job history with deletion.
- Users may edit permitted non-secret preferences; shared AI credentials, models and budgets belong to the **platform admin (owner only)**.
- Budget amounts are created in the admin dashboard. Initial allowances are **USD 0**, AI disabled.
- External AI processing remains permitted; conflicts hold; passing QMS auto-releases and saves scoped knowledge.
- Minimal, conversational UI (`D-025`), direct client spreadsheet edits in chat (`D-026`), SA-SAMS 2-file student & subject-percentage matrix engine (`D-028`), 4-Vertical Sign-Up + Luhn SA ID auto-repair + CAPS 1–7 calculator + Multi-Batch Folder Upload (`D-029`), and Strictly Tailored 4-Vertical Light Workspaces with Everyday Non-Technical Language (`D-030`).

## Current phase

**v0.2 online workspace + strictly tailored 4-vertical light UI built and verified against development adapters; live cloud deployment and production acceptance remain OPEN.**

Implemented in `sheetqms-cloud/`:
- **Strictly Tailored 4-Vertical Workspaces (`D-030`):** Each vertical (`education`, `sme_pa`, `finance_hr`, `supply_chain`) renders its own 4 top navigation tabs, its own 3 big *"What would you like to do today?"* action cards, its own filtered example buttons, its own 4 sheet toolbar buttons, its own `Create Sheet` preset, and its own filtered `Templates` library.
- **Everyday Non-Technical Language + Clean Light Theme Default (`D-030`):** Warm, bright Light Theme by default (`<body class="light">`, `Preferences.theme = 'light'`), everyday labels (`"Sheet Helper"`, `"✓ Ready to Download"`, `"Needs 1 Quick Answer"`, `"Fill My Sheet"`, `"Fix SA IDs & Phones"`, `"Pass Levels (1–7)"`), and technical details (`Saved Rules`, `Mapping JSON`, `Audit JSON`) tucked inside a collapsed `Advanced & Technical Details (Optional)` toggle in `Past Files & Settings`.
- **SA-SAMS 2-File Import + Luhn 13-Digit SA ID Auto-Repair + Multi-Batch Folder Upload (`D-028`, `D-029`):** Joins 2+ relational sheets by Learner ID, turns horizontal subject-percentage grids into `; `-joined `Subjects`, repairs stripped leading zeros (`2000–2009`) with official South African modulo-10 Luhn validation while keeping all rows and adding an `SA ID Status` column, calculates CAPS Levels (1–7), and merges entire folders of spreadsheets into one Master Sheet with `Source File` and `Duplicate Status` columns.

## Executed verification — v0.2 (`sheetqms-cloud/`)

- Full pytest: **71 passed, 1 test-client deprecation warning**, exit 0 (`15.24s`). Evidence: `sheetqms-cloud/verification/automated-tests.txt`.
- Bundle build: `web/app.ts` $\rightarrow$ `web/app.js` (`1075.1kb` with SheetJS `.xls`/`.xlsx` engine + Stacked Multi-Section Table Splitter + Grade 8 & 9 Senior Phase `image-1.png` & FET `image-2.png` Mark Schedule Parser + 6-Digit `YYMMDD` DOB Extraction + Uniform `STU0001..STU1800` Counting Batch `Student ID` (`D-037`–`D-043`), `styles.css?v=b331f82728e9`, `app.js?v=456e1ca3d8da`).
- Deliverable archive: `/home/user/SheetQMS-online.zip` (`1,728,113 bytes`, 64 files, `sha256=b7b3755fa4351358a5f0296ecae0eb23c0bab1169d7162a328ba85e7e94aa1c3`).

## Running development preview & published GitHub Pages preview

- **Arena Sandbox FastAPI Preview:** `EduSheetManager — by EduSCF` is running on port **3001**, managed process `edusheetmanager-by-eduscf-c7d52fd8` (`SHEETQMS_DEMO=1`).
- **GitHub Repository & Pages:** `https://github.com/demo0ps/SheetQMS` and `https://demo0ps.github.io/SheetQMS/` updated at commit `b9d4216` (`b9d42166a73915f19a57e000c3ff86b01b7a0a22`), serving `<title>EduSheetManager — by EduSCF</title>`, `styles.css?v=b331f82728e9`, and `app.js?v=456e1ca3d8da` (`0` token occurrences in `/home/user` or `/tmp`).

## Known gaps / blockers before production

1. **Not deployed to the public internet yet:** no owner cloud account, PostgreSQL URL, R2 bucket, stable encryption key or domain has been supplied.
2. Live PostgreSQL/R2 integration, cold starts, real-phone/browser checks, live AI provider calls/pricing/terms and real business spreadsheets remain unverified.
3. Guided chat handles specific supported corrections and explanations; broad free-form interpretation requires an admin-configured, budgeted, consented AI provider.
4. Invite-only customer creation is implemented; public self-signup, email delivery/password reset and independent security review are not implemented.
5. Job deletion removes stored blobs, job state and chat history while retaining minimal append-only audit and QMS-passed structural knowledge.
6. Dashboard budget amounts are app-enforced allowances/planning values, not provider-enforced cloud billing caps.

## Next / handoff

Owner: review `SheetQMS online workspace` on port 3001 and `SheetQMS-online.zip`. When ready to publish online, provision PostgreSQL + private R2 + Cloud Run (or provide your target cloud account workflow out of band), set secrets in the cloud secret manager, run `python -m sheetqms.migrate`, and run the live-URL verification checklist in `docs/DEPLOY.md`.

**Batch 1 (EduSheetManager UX) — built, verified locally (D-044).** Pending: commit and Pages push (not yet done); batches 2 and 3 not started.
