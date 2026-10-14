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

- Full pytest: **71 passed, 1 test-client deprecation warning**, exit 0 (`14.66s`). Evidence: `sheetqms-cloud/verification/automated-tests.txt`.
- Bundle build: `web/app.ts` $\rightarrow$ `web/app.js` (`1050.1kb` with SheetJS `.xls`/`.xlsx` engine + SA-SAMS/GDE 2-sheet Bio + Mark Schedule joiner with Strict Grade + Gender + 1-to-1 Lock, Grade 8/9 CAPS Senior Phase 9-subject auto-fill, blank `Parent Email` on Bio sheets without parent email columns, full multi-format Bio `Birth Date`/`Date of Birth` normalization across Grades 8–12, and no same-sheet learner merging (`D-037`, `D-038`, `D-039`), `styles.css?v=b331f82728e9`, `app.js?v=269a6c4a92ad`).
- Deliverable archive: `/home/user/SheetQMS-online.zip` (`1,707,836 bytes`, 64 files, `sha256=d45fecd456d5d1751c0efc38662f934dd0abce1a9f80058b36d34ff185c4f1ad`).

## Running development preview & published GitHub Pages preview

- **Arena Sandbox FastAPI Preview:** `EduSheetManager — by EduSCF` is running on port **3001**, managed process `edusheetmanager-by-eduscf-9ef38e81` (`SHEETQMS_DEMO=1`).
- **GitHub Repository & Pages:** `https://github.com/demo0ps/SheetQMS` and `https://demo0ps.github.io/SheetQMS/` (note: to push `D-039` (`app.js?v=269a6c4a92ad`) to GitHub Pages, provide a transient GitHub PAT for `demo0ps/SheetQMS` as earlier tokens are immediately wiped after push per credential hygiene).

## Known gaps / blockers before production

1. **Not deployed to the public internet yet:** no owner cloud account, PostgreSQL URL, R2 bucket, stable encryption key or domain has been supplied.
2. Live PostgreSQL/R2 integration, cold starts, real-phone/browser checks, live AI provider calls/pricing/terms and real business spreadsheets remain unverified.
3. Guided chat handles specific supported corrections and explanations; broad free-form interpretation requires an admin-configured, budgeted, consented AI provider.
4. Invite-only customer creation is implemented; public self-signup, email delivery/password reset and independent security review are not implemented.
5. Job deletion removes stored blobs, job state and chat history while retaining minimal append-only audit and QMS-passed structural knowledge.
6. Dashboard budget amounts are app-enforced allowances/planning values, not provider-enforced cloud billing caps.

## Next / handoff

Owner: review `SheetQMS online workspace` on port 3001 and `SheetQMS-online.zip`. When ready to publish online, provision PostgreSQL + private R2 + Cloud Run (or provide your target cloud account workflow out of band), set secrets in the cloud secret manager, run `python -m sheetqms.migrate`, and run the live-URL verification checklist in `docs/DEPLOY.md`.
