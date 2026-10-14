# Decision record

Updated: 2026-10-12

Keep confirmed decisions distinct from proposals. Preserve superseded decisions rather than silently replacing their history.

## D-001 — Team operating model

**Status:** Confirmed by the owner.

**Source:** The owner instructed that the assistant operates as a team and reiterated, "you are a team."

**Decision:** Organise work through specialist responsibilities, coordinated toward a shared goal, with documented project state and handoffs.

**Reason:** The owner wants accountable development-team working practices, not undifferentiated ad-hoc implementation.

**Consequence:** The source profile's "working alone" description does not match this operating model. Its wording needs alignment. The source attachment has not yet been edited.

**Execution accuracy:** This agreement establishes a team-style operating structure. Do not claim separate people, independently executing agents, or completed specialist reviews without evidence.

## P-002 — Expanded specialist roster and review workflow

**Status:** Proposed; not yet approved by the owner.

**Proposal:** Adopt the 13 roles and workflow in TEAM.md. Activate only the roles relevant to each task. Give every task one accountable owner, appropriate reviewers, acceptance criteria, and a written handoff.

**Reason:** Additional specialities are useful only when they produce clear outcomes and checks. Selective activation avoids needless ceremony and cost.

**Trade-off:** More explicit planning and evidence take effort, but should reduce ambiguity, rework, and false completion claims.

## P-003 — Lean shared records

**Status:** Proposed structure; initial draft records created.

**Proposal:** Begin with TEAM.md, STATUS.md, and DECISIONS.md. Add the agreed brief and client profile when known. Keep a short backlog in STATUS.md until a separate task record is justified.

**Reason:** Preserve continuity without introducing multiple competing sources of truth.

**Limit:** Creating the records does not imply approval of every proposal they contain.

## O-004 — Client reference remains unresolved

**Status:** Open; no client selection made.

**Observation:** The source profile names docs/profiles/the-box-house.md, but only the generic brand template and agent profile were supplied.

**Handling:** Do not assume the named client is the current project. Select and complete a brand profile explicitly before using client-specific facts.

**Next action:** Resolve when the first project brief is supplied. Keep client details out of the generic core profile.

## D-005 — Spreadsheet transformation project goal

**Status:** Confirmed requirement from the owner.

**Decision:** The product must populate a destination spreadsheet from multiple messy sources using AI-assisted mapping and transformations beyond column matching, explicitly including rows into columns. Relevant rules must be applied, output checked before delivery, and unclear requirements clarified.

**Reason:** Simple positional or header matching is insufficient for the owner's source material.

**Limit:** File structures, authoritative rules, expected examples, and acceptance criteria have not yet been supplied. No implementation or stack has been selected.

## D-006 — QMS coordination is required

**Status:** Confirmed functional requirement; implementation and authority unresolved.

**Decision:** Include a QMS coordination function in the pre-delivery workflow.

**Open questions:** Human, automated, or both? Who authorises release? Which checks and exception policies govern approval?

**Consequence:** Do not treat a generated workbook as final merely because the mapping process completed.

## O-007 — Meaning of "perfect" output

**Status:** Open acceptance-definition item.

**Observation:** The owner requests perfect output. Correctness must be grounded in authoritative rules and expected examples; AI confidence is insufficient and unknown business meaning cannot be proven automatically.

**Next action:** Agree measurable checks and the handling of ambiguities, missing inputs, unsupported workbook features, and rule conflicts. Do not make a blanket accuracy guarantee.

## P-008 — Proposed interpretation/execution/verification separation

**Status:** Proposed, not an approved architecture.

**Proposal:** Use AI to interpret layouts and propose traceable structured mappings; execute approved transformations with controlled operations; run defined validation; route evidence and unresolved questions through the QMS function before release.

**Reason:** This separates uncertain interpretation from reproducible transformation and explicit quality decisions.

**Safety defaults:** Do not send workbook contents to an external AI service without explicit permission, overwrite source originals, or silently release unresolved mappings. Proposed configuration switches are recorded in BRIEF.md; none are implemented.

## D-009 — Destination templates vary

**Status:** Confirmed in the discovery answers.

**Decision:** Support destination templates that vary by client or job, rather than assuming one fixed workbook.

**Open detail:** Template selection, versioning, and actual structures need sample files and rules. Do not silently select a template when the job identity is ambiguous.

## D-010 — Rules are embedded in workbooks

**Status:** Confirmed in the discovery answers.

**Decision:** Inspect the workbooks for authoritative mapping and quality rules.

**Limit:** The rules' actual contents and precedence remain unknown until representative files are supplied. Workbook text and macros are not permission to execute arbitrary code, disclose data, or override security controls.

## D-011 — QMS is automated

**Status:** Confirmed in the discovery answers; resolves the human/automated choice in D-006.

**Decision:** Use an automated QMS coordination function. Passing results may be released under agreed checks; ambiguous or failed results are held for clarification.

**Open detail:** Exact checks, release criteria, supported features, and exception policy require definition. Automation does not provide a blanket guarantee of semantic correctness.

## O-012 — API key with no data leaving the platform

**Status:** Unresolved constraint; external transfer not authorised.

**Owner statement:** "we will add a api key but no data leaves the platform"

**Technical issue:** API authentication and data locality are separate. Conventional external AI requests transmit their payload to the provider even if retention and training are disabled.

**Handling:** Keep external transfer disabled. Clarify whether strict containment requires inference inside the controlled platform boundary or whether approved external processing is permitted. Also identify whether the platform already exists.

**Credential rule:** Do not ask for a key in chat. Set it through private secret configuration only after the model endpoint and data policy are agreed.

## D-013 — Strict containment and private inference

**Status:** Confirmed in the follow-up answer; resolves the policy choice in O-012.

**Decision:** No external AI provider receives workbook data. Interpretation and mapping inference must run inside the controlled platform boundary, using an internal/private endpoint if API-key authentication is desired.

**Reason:** The owner selected strict containment rather than external processing with no-retention settings or limited redacted transfer.

**Consequence:** A conventional public AI API cannot be used for workbook content. No-retention and no-training terms do not fulfil this requirement. Exact hosting, compute, private model, and enforcement still need selection and testing.

**Discovery boundary:** This conversation is not the future private deployment. Request only synthetic or explicitly approved non-sensitive examples here. If the layouts or rules are confidential, start with a local inspection tool and approved sanitised findings rather than original-file uploads.

## D-014 — Build a new platform

**Status:** Confirmed in the follow-up answer.

**Decision:** Build a new system rather than assuming integration into an existing application.

**Open detail:** Browser versus local UI, host ownership, user access, workload, and hardware constraints remain unconfirmed. No stack, model, server, or paid dependency has been selected.

## D-015 — External AI permitted; earlier containment superseded

Status: Confirmed in the latest clarification answer.

The owner selected External cloud AI API, whose option explicitly states that workbook content sent for inference leaves the platform. This supersedes D-013. The local application retains files locally but is not a zero-transfer system when external analysis is used. No provider/model or retention terms are selected; no live processing has been performed.

## D-016 — Local runtime and focused scope

Status: Confirmed owner choices and instruction.

Run on the owner's computer. Scope only spreadsheet transformation and its rules, knowledge, QMS, clarification and necessary settings. The owner has no data yet; develop with synthetic known-answer fixtures rather than claim unseen-data accuracy.

## D-017 — Rule conflicts require clarification

Status: Confirmed.

Conflicting workbook and saved business rules hold the job until explicitly resolved. Neither is silently given precedence. Core safety controls cannot be overridden.

## D-018 — Automatic, scoped knowledge after QMS

Status: Confirmed.

Save reusable structural mappings after all required QMS gates pass. Scope them to template version and input layout. Retain rule versions and audit the learning event; do not put raw source rows or keys into learned knowledge. Passing checks can still miss unknown semantic mistakes, so reuse is not a blanket correctness guarantee.

## ADR-001 — Local foundation and optional, capped paid inference

Status: Initial implementation choice; defaults documented in BRIEF.md.

Use a local Python/browser application, open-source workbook handling and SQLite. No hosting subscription or paid runtime dependency required for synthetic/deterministic operation.

Metric that triggers paid use: an explicit owner-consented AI analysis when a provider/model, key, recent verified prices and positive monthly budget are configured. Default AI is disabled and budget is zero. Reserve estimated upper-bound app-mediated cost atomically before requests; no automatic retries. Configure a separate provider-account cap as the app cannot govern unrelated account usage or incorrect prices.

Actual provider pricing: not checked or quoted, because the owner has not selected a provider/model. No paid request is authorised by the default configuration.

Initial adapters: OpenAI-compatible and Anthropic formats. Keys entered in local Settings are server-memory-only for that run. No actual keys in source, logs or chat. Preview rejects real keys/live calls. Persistent keychain support is deferred rather than silently writing plaintext secrets.


## D-019 — Rule authority and exclusion provenance

Status: Implemented; synthetic tests passed.

AI may propose checks but cannot create authority just by labelling a requirement. Parsed workbook requirements or an explicit operator-confirmed contract ground certification. Column/cell exclusions require operator confirmation; alias mismatches ask. Sum aggregation authorises only the named pivot category fields. A fresh AI proposal invalidates earlier operator approval. Free-text answers do not waive QMS.

## D-020 — Conservative numeric and workbook boundaries

Status: Implemented; synthetic tests passed.

Numeric strings with separators require declared locale; malformed grouping holds. Excel numeric cells retain their native numeric meaning. Original/final hashes gate delivery, actual Excel formula coordinates distinguish formulas from inert text, cached supported formulas are checked independently and unsafe precision holds. Unsupported source native validation holds pending an input-stage compiler. Limits are capacity safeguards, not production benchmarks.

## D-021 — Text row labels to destination columns

Status: Implemented and tested on fictional known-answer forms.

One A-label/B-value record per source sheet can populate direct-mode destination columns, including text. Every non-metadata cell needs mapping or explicit exclusion. Formula-valued/non-adjacent/repeated-block forms are not supported. Row-label positions enter the reusable structural fingerprint; source values do not. This extends the row-to-column proof beyond numeric pivots without arbitrary generated code.

## D-022 — Evidence-bound prototype handoff

Status: Synthetic automated/browser checks passed; production acceptance open.

73 automated tests, 22 browser workflow checks, strict TypeScript compilation and zero axe findings in 14 scanned states are executed evidence only. Real data, owner device, live provider/prices/terms and public-proxy access are not verified. E2B direct external requests need platform traffic authentication; no public-access/security gate is relaxed. The source ZIP excludes private state, credentials and dependencies. No independent-agent review is claimed.


## D-023 — Internet/serverless target and conversational QMS

Status: Owner-requested direction; implementation details pending clarification (2026-10-13).

The owner asks to replace the local-only product target with a fully functional internet/serverless application, modern tech-tool UI, job-focused text chat and an admin Settings dashboard. This supersedes the local-only delivery target in D-016, not the existing prototype's verified evidence. Multi-user/tenant permissions, settings visibility, private-cloud storage/retention, provider/account and spend remain unconfirmed. Shared credentials must not be returned to ordinary users. Prior QMS hold/conflict and post-pass knowledge policies remain active; conversational replies cannot waive checks. No claim of serverless deployment or live AI verification is made yet.


## D-024 — Multi-customer online model, admin control plane and guided QMS chat

Status: Confirmed by owner answers and implemented in `sheetqms-cloud/` (2026-10-13).

1. **Audience:** separate customer accounts with isolated files, conversations, jobs and learned knowledge.
2. **Settings split:** ordinary users see approved non-secret AI status and edit personal workspace preferences (theme, density, explanation style, manual/auto check rerun). Only the platform admin (owner) manages shared AI credentials, models, budgets, quotas and customer provisioning. Shared API keys are write-only, encrypted at rest and never returned.
3. **Cloud job history:** originals, outputs and QMS conversations persist privately per customer, with customer job deletion.
4. **Budgets:** amounts are created in the admin dashboard; initial platform and AI budgets are USD 0 with AI disabled.
5. **QMS conversation:** job-scoped chat explains blocking gates, turns supported replies into explicit confirmable proposals, records operator-supplied values as a separate audited source without mutating originals, and reruns deterministic QMS before release. Replies never waive failed checks.

## ADR-002 — Scale-to-zero Cloud Run + serverless PostgreSQL + private R2

Status: Proposed and packaged in `sheetqms-cloud/`; live cloud deployment pending owner account/secrets.

- **Decision:** Package the online app as a stateless container for Google Cloud Run (request-based billing, min instances 0) backed by PostgreSQL (e.g. Neon scale-to-zero) and Cloudflare R2 private object storage.
- **Why not edge Python Workers:** Official Cloudflare Workers limits checked 2026-10-13 show 10 ms CPU on Free, 128 MB isolate memory including WebAssembly, ephemeral filesystem and early PyEmscripten native-wheel coverage, which is a poor drop-in fit for openpyxl/ZIP/XML/Decimal workbook processing.
- **Cost & trigger metric:** Free tiers checked 2026-10-13 on official pages (Cloud Run 2M requests / 180k vCPU-s / 360k GiB-s request-based; Neon Free 100 CU-hours and 1 GB storage/project; R2 Free 10 GB-month, 1M Class A, 10M Class B, zero egress). Paid tiers are triggered only when owner-approved budgets are set in Admin and measured usage exceeds free allowances. App budget settings do not replace provider billing alerts/caps.

## D-025 — Minimal conversational UI with zero technical clutter

Status: Implemented and verified in `sheetqms-cloud/` (2026-10-13) after owner feedback ("it has too much infomation, keep it simple on the user, keep it minimal and simple for the user no hard work or thinking, basic conversational engagement to get the desired outcome").

1. **Minimal two-panel layout:** Removed the left sidebar, multi-card dashboards, metric strips, trace IDs and technical checklists from the main view. The workspace now shows only two calm panels: **QMS Assistant** (left) and **Your Output Spreadsheet** (right).
2. **Conversational easy-speech & clarifying questions:** QMS speaks in 1–2 short, friendly sentences (`sheetqms/online.py`), understands everyday speech without technical syntax (e.g. `"18"`, `"put 18"`, `"yes"`, `"sure"`, `"go"`, `"put Boxes in Qty"`, `"use Boxes for Qty"`, `"Boxes"`), remembers conversation context across turns (`pending_number`, `pending_cell`, `pending_source_col`, `pending_target_col`), and asks natural clarifying questions whenever a column match or blank cell is ambiguous.
3. **Technical details hidden by default:** Mapping JSON, audit downloads, source cell previews and the 21-gate checklist are tucked inside a collapsed `<details>` drawer at the bottom of the result card.

## D-026 — Direct execution of client spreadsheet edit requests in chat

Status: Implemented and verified in `sheetqms-cloud/` (2026-10-13) after owner feedback ("the qms keeps on not doing what i request claiming he wants to understand, fix that, i need it to do what the client requests").

1. **Direct spreadsheet edits in chat (`execute_client_edit` + `save_edited_workbook`):** Instead of refusing post-run or structural table requests with a fallback message, QMS now directly executes client requests on the output spreadsheet and regenerates the downloadable `.xlsx` workbook:
   - Swapping/replacing/reordering rows (e.g. `"replace the first row with row 2"`, `"swap row 1 and row 2"`, `"swap North and South"`, `"put South first"`).
   - Swapping/replacing columns (e.g. `"swap Jan and Feb"`, `"switch Jan with Mar"`, `"replace Jan with Feb"`, or row-scoped `"swap North Jan and Feb"`).
   - Multi-turn bare action follow-up (`"swap"`, `"switch"`, `"replace"`, `"change"`, `"edit"`, `"update"`): remembers `pending_intent` (`swap`/`replace`), asks which columns or rows to swap/change, and executes immediately on the next reply (e.g. `"jan and feb"`).
   - Cell updates (`"change North Jan to 25"`), column math (`"add 10 to Jan"`, `"double Jan"`), sorting (`"sort by Total"`), renaming columns (`"rename Jan to January"`), adding rows (`"add row East 10 20 30"`), and deleting rows/columns (`"delete row 2"`, `"remove West"`), with automatic recalculation of `sum` rule totals (`Total`).

## D-027 — GitHub repository creation, live GitHub Pages preview, and credential hygiene

Status: Published and verified on `https://github.com/demo0ps/SheetQMS` and `https://demo0ps.github.io/SheetQMS/` (2026-10-13).

1. **Repository & live preview published:** Created `https://github.com/demo0ps/SheetQMS` (`main` branch, commit `5c42f14cbc7b55e9b33740053c40ac38a7e6a295`, 51 files) and enabled GitHub Pages (`source: main /`, build `1281526803`, `status: built`) at `https://demo0ps.github.io/SheetQMS/`.
2. **Dual-mode runtime (FastAPI backend + static browser preview fallback):** When served by FastAPI (`localhost:3001` or Cloud Run), `web/app.ts` uses `/api/...` server endpoints. When served on static GitHub Pages (`https://demo0ps.github.io/SheetQMS/`), `web/app.ts` automatically falls back to an in-browser SheetQMS engine (`localStorage` + pure-TypeScript OpenXML `.xlsx` generator) so the live preview link works end-to-end without a server.
3. **Credential hygiene:** The GitHub PAT pasted in chat was used only in transient process memory from `/tmp/sheetqms-publish` (immediately deleted), never written to `/home/user`, `.env`, `.git/config` or committed files. The owner must revoke/rotate the chat-exposed token immediately.

## D-028 — SA-SAMS 2-file student & subject-percentage matrix engine + multi-sheet relational joins

Status: Confirmed by owner via screenshots (`image-1.png`, `image-2.png`) and `ask_user`, implemented and verified in `sheetqms-cloud/` (2026-10-14).

1. **Multi-sheet relational key-join in `direct` mode:** When 2+ separate Excel/CSV files are uploaded (e.g., SA-SAMS Sheet 1 with Learner/Parent Bio and SA-SAMS Sheet 2 with Subject Marks Schedule), `infer_plan` and `build_rows` automatically join records per learner by `Student ID` / `Admission No` (with fallback to `First Name + Last Name`) and record provenance for all contributing source rows.
2. **Horizontal Subject-Percentage Matrix → Joined `Subjects` column (`any_mark_not_blank`):** When the destination template includes a `Subjects` (or `Courses` / `Modules`) column and a source sheet contains vertical Subject columns across the top (`Mathematics`, `English`, `Science`, `Physical Science`, `Natural Science`, `Geography`, etc.) with horizontal percentages/marks inside each learner's row, `normalize_sources` collects every subject column where the learner has a non-blank mark (skipping blank, `-`, `N/A`, and summary columns like `Average`/`Total`) and joins them with `"; "`.
3. **Smart student field formatting (`enforce_all_four`):** Automatically formats `Grade` as `"Grade X"` (e.g. `8` / `"Gr 7"` → `"Grade 8"` / `"Grade 7"`), `Date of Birth` as `"YYYY-MM-DD"`, preserves/restores leading `"0"` on `Parent Phone` (e.g. numeric `821234567` or `"+27 84 765 4321"` → `"0821234567"` / `"0847654321"` written as an explicit string cell in `.xlsx`), and formats `Subjects` with `"; "`.
4. **General multi-account architecture preserved:** Isolated `customer_accounts` remain completely general so the school account can run SA-SAMS 2-file student imports while other customer accounts upload their own business templates and messy spreadsheets.

## D-029 — 4-Vertical Sign-Up & Dynamic Tooling, Luhn 13-Digit SA ID Auto-Repair, CAPS Levels (1–7), and Multi-Batch Folder Upload

Status: Confirmed by owner via discussion and `ask_user` (`four_specialized_verticals`, `self_signup_plus_quick_vertical_launch`, `saved_at_signup_plus_top_bar_switcher`, `smart_stack_or_join_with_source_col`, `keep_all_flag_cross_file_duplicates`), implemented and verified in `sheetqms-cloud/` (2026-10-14).

1. **4 Specialized Verticals at Sign-Up + Switchable Anytime:** Users choose from 4 verticals at sign-up (`POST /api/auth/signup`) or via 4 quick-launch buttons on the login screen (`POST /api/auth/demo`):
   - `education`: **🎓 Education & SA-SAMS** (Schools, District Offices, EMIS & Educational Consultants),
   - `sme_pa`: **💼 SME Business & PA** (Small Business Owners, Quotations, Tax Invoices & CRM),
   - `finance_hr`: **📊 Finance, Accounting & Payroll** (Branch Consolidations, HR, Payroll & Reconciliation),
   - `supply_chain`: **📦 Supply Chain, Inventory & ERP** (Procurement, Warehouses & Supplier Stock).
   The active vertical is persisted per customer workspace and can be switched anytime from the top navigation bar (`#vertical-picker`) or the `Preferences` tab.
2. **Luhn-Validated 13-Digit South African ID Validator & Born 2000–2009 Leading-Zero Auto-Repair (`validate_and_repair_sa_id`):**
   - Automatically pads 11/12-digit SA IDs where Excel stripped leading `'0'` or `'00'` (born 2000–2009) back to 13 digits (`'0803055123084'`) and writes them as explicit string cells (`data_type = 's'`) in `.xlsx` exports.
   - Validates the 13th digit using the official South African Home Affairs modulo-10 Luhn checksum.
   - Extracts `Date of Birth` (`YYYY-MM-DD`), `Gender` (`Male`/`Female`), and `Citizenship` (`SA Citizen` / `Permanent Resident`).
   - Preserves all rows in the main sheet (`1. a`) and adds an `SA ID Status` column (`Valid SA ID`, `Repaired SA ID (Leading 0 Restored)`, `Foreign / Passport / Permit ID`, `Invalid SA ID (Checksum Failed)`).
3. **CAPS Achievement Level (1–7) & Academic Risk Calculator (`caps_levels`):** Converts subject percentage marks (`0–100%`) into official South African CAPS Achievement Levels (`Level 1` to `Level 7`) and flags `At Risk` learners (`Level 1–2` / `< 40%`).
4. **Multi-Batch Folder Processing (`POST /api/jobs/batch-folder` + `webkitdirectory`):** Allows uploading an entire folder of spreadsheets at once and merging them into one Master File automatically — smart auto-detect joins 2-file relational pairs or stacks homogeneous spreadsheets into one Master Sheet with a `Source File` column, flags cross-file duplicates in `Duplicate Status` (`Duplicate across: ...`), and generates a **Batch & Consultant Data Quality Audit Certificate**.

## D-030 — Strictly Tailored 4-Vertical Workspaces, Everyday Non-Technical Language, and Clean Light Theme Default

Status: Confirmed by owner via `ask_user` (`strict_vertical_workspace`, `plain_english_with_advanced_toggle`, `clean_light_default_with_action_cards`), implemented and verified in `sheetqms-cloud/` (2026-10-14).

1. **Strictly Tailored Workspace per Vertical (`strict_vertical_workspace`):**
   - Each vertical (`education`, `sme_pa`, `finance_hr`, `supply_chain`) strictly shapes its own top navigation tabs (`vMeta.tabs`), its own 3 big *"What would you like to do today?"* home action cards (`vMeta.cards`), its own strictly filtered example buttons (`vMeta.samples`), its own 4 sheet toolbar buttons, its own vertical preset in `Create Sheet`, and its own filtered `Templates` page (`vMeta.templateCategories`).
   - For example, `education` hides `Quotes & Invoices` and shows only `School Sheets & SA-SAMS`, `Create Class Sheet`, `School Templates`, and `Past Files & Settings`, with `Pass Levels (1–7)` and `Fix SA IDs & Phones` on the sheet toolbar.
2. **Everyday Plain-English Language + Technical Details Hidden in Settings (`plain_english_with_advanced_toggle`):**
   - Replaced technical jargon (`"QMS"`, `"Released/Held"`, `"Mapping JSON"`, `"Audit JSON"`, `"Luhn"`, `"21/21 checks"`) across the main workspace with warm, everyday wording (`"Sheet Helper"`, `"✓ Ready to Download"`, `"Needs 1 Quick Answer"`, `"Fill My Sheet"`, `"Fix SA IDs & Phones"`, `"Pass Levels (1–7)"`, `"Remove Duplicates"`, `"Summary Report"`).
   - Moved `Saved Rules`, `Inspect Current Mapping JSON`, and `Download Technical Audit JSON` inside a collapsed **`Advanced & Technical Details (Optional)`** section at the bottom of `Past Files & Settings`.
3. **Clean Light Theme Default (`clean_light_default_with_action_cards`):**
   - Defaulted `Preferences.theme` to `'light'` in both backend (`sheetqms/online_models.py`), HTML entry points (`web/index.html`, `index.html`), and static state (`web/app.ts`), while preserving optional Dark Mode in Settings.

## D-031 — Default Regular/Everyday User Mode, Warm Paper & Calm Sage-Teal Palette (Zero Dark Overlap), and Spacious Layout

Status: Confirmed by owner via `ask_user` (`default_regular_user_mode`, `warm_cream_and_sage`, `spacious_calm_layout`), implemented, verified, and deployed to `https://demo0ps.github.io/SheetQMS/` at commit `88584d1` (2026-10-14).

1. **Default to `'general'` (`✨ Everyday / Regular User`) First (`default_regular_user_mode`):**
   - Regular everyday users can enter and use the platform immediately without choosing an industry vertical. The Welcome/Sign-In card features a single primary button (`✨ Start as Regular / Everyday User →`), and Sign-Up defaults to `general` (`✨ Everyday / Regular User`).
   - The 4 specialized industry packs (`education`, `sme_pa`, `finance_hr`, `supply_chain`) remain available inside an optional collapsible section on the welcome screen and via the top-bar workspace mode switcher.
2. **Warm Paper & Calm Sage-Teal Palette with Zero Dark Overlap (`warm_cream_and_sage`):**
   - Rewrote `web/styles.css` from `:root` up so every element — sign-in card, top navigation bar, buttons, badges, chat cards, spreadsheet tables, dropdowns, modals, and toasts — uses warm paper (`#FAF8F5`), crisp white cards (`#FFFFFF`), soft warm sand headers (`#F4F1EA`), soothing sage-teal accents (`#0F766E`), and warm charcoal text (`#1F2933`), removing all legacy dark-navy `#0f1628`/`#131c30`/`#1b2640` overlaps.
3. **Spacious & Calm Layout (`spacious_calm_layout`):**
   - Increased breathing room, card padding, and readable typography (`15.5px`), and streamlined the quick-tools bar to 3 calm buttons at a time.

## D-032 — Rebrand to EduSheetManager, by EduSCF with Powered by EduSCF Logo Badge

Status: Confirmed by owner via `ask_user` (`edusheetmanager_with_by_eduscf_tag`, `signin_and_page_footer`, `update_exports_and_printables`), implemented, verified, and deployed to `https://demo0ps.github.io/SheetQMS/` at commit `86b3921` (2026-10-14).

1. **Brand Name & Header (`edusheetmanager_with_by_eduscf_tag`):**
   - Preserved the platform's teal grid icon (`.logo-box`) and updated the brand title beside it to **`EduSheetManager`** with a subtle **`by EduSCF`** pill tag (`.brand-by`), plus updated `<title>EduSheetManager — by EduSCF</title>` in both HTML entry points.
2. **"Powered by EduSCF" Badge on Welcome Card & Page Footer (`signin_and_page_footer`):**
   - Cropped and optimized the attached EduSCF logo (`/home/user/uploads/5942776253129625469.jpg` $\rightarrow$ `web/eduscf-logo.png` & embedded data URI `web/eduscf_logo.ts`) so it renders reliably across FastAPI, GitHub Pages, and print dialogs.
   - Added a clean **`Powered by [EduSCF Logo]`** badge (`.powered-by-eduscf`) at the bottom of the Welcome/Sign-In card and inside a calm page footer (`<footer class="app-footer">`) across every workspace screen while keeping the top navigation bar minimal.
3. **Exported Filenames & Printable Reports (`update_exports_and_printables`):**
   - Updated default downloaded filenames to `EduSheetManager-verified.xlsx` and `EduSheetManager-evidence.json`, and added the `Powered by [EduSCF Logo]` credit to printable PDF Quotes/Tax Invoices and the Data Quality Summary Report modal.

## D-033 — Unified 1-Screen "My Spreadsheet" Workspace, Step 1-2-3 Visual Guide, and 1-Click Sales Demos

Status: Confirmed by owner via `ask_user` (`unified_one_workspace`, `always_split_view`, `self_selling_guided_steps`), implemented, verified, and deployed to `https://demo0ps.github.io/SheetQMS/` at commit `028eb2b` (2026-10-14).

1. **Unified 1-Screen Workspace (`unified_one_workspace`):**
   - Merged `Clean & Combine Sheets` and `Create New Sheet` into a single **`My Spreadsheet`** screen so users never wonder which tab to use.
   - Users can upload messy Excel/CSV files, merge an entire folder, click a 1-Click Demo, OR type what columns they want to create from scratch (`"Columns: Name, Phone, Fee, Paid"`) inside the same left-hand AI Helper chat box.
2. **Always-Visible Split View (`always_split_view`):**
   - Left panel (`STEP 1 & 2 · AI Sheet Helper`) has the upload drawer open by default and the chat input always enabled from the very start.
   - Right panel (`STEP 3 · Your Live Spreadsheet`) displays the spreadsheet table and 1-Click Fixes toolbar beside the chat at all times.
3. **Self-Selling Step 1 → Step 2 → Step 3 Visual Guide (`self_selling_guided_steps`):**
   - Added a 3-step visual strip (`STEP 1: Load or Create` $\rightarrow$ `STEP 2: Tell the AI Helper` $\rightarrow$ `STEP 3: Download Excel (.XLSX)`) and 3 prominent **1-Click Demo** cards at the top of the screen so the platform practically demos and sells itself.

## D-034 — Clean, Airy Workspace (No Step Bar / Top Card Clutter) + Interactive On-Screen Pointer Guide ("Click This → Then This → Then That")

Status: Confirmed by owner via `ask_user` (`interactive_spotlight_tour`, `clean_airy_sheet_and_chat_only`), implemented, verified, and deployed to `https://demo0ps.github.io/SheetQMS/` at commit `b22617b` (2026-10-14).

1. **Clean, Airy Workspace (`clean_airy_sheet_and_chat_only`):**
   - Removed the static top step-by-step bar (`steps-strip`), top cards (`vertical-welcome`), and permanently open upload boxes so the workspace feels open, spacious, and never crowded (`max-width: 1400px`, `padding: 34px 36px 56px`, `gap: 32px`).
   - Collapsed file uploads and demo selection inside a single clean **`Open / Upload File (or try a demo)`** button (`#tour-open-btn`) at the top of the **Sheet Helper** panel.
2. **Interactive On-Screen Pointer Guide (`interactive_spotlight_tour`):**
   - Clicking **`Guide`** in the top bar (or **`Show Me Where to Click (Interactive Guide)`** inside the Helper greeting) launches an interactive on-screen spotlight tour (`startInteractiveGuide()`) that highlights each button on screen with a pulsing sage-teal ring (`.tour-active-target`) and a floating pointer card (`.tour-popover`):
     - **Step 1 of 4 (`#tour-open-btn`):** *"👆 1. Click This First: Open or Upload"*
     - **Step 2 of 4 (`#chat-form`):** *"👆 2. Then Click Here: Ask in Plain Words"*
     - **Step 3 of 4 (`#output-table-area`):** *"👆 3. Then Check Your Spreadsheet Here"*
     - **Step 4 of 4 (`#download-output`):** *"👆 4. Finally, Click That: Download Excel"*

## D-035 — Full Legacy `.xls` (BIFF8 Binary, HTML-Table `.xls`, XML 2003 `.xls`) Support & Post-Upload Crash Fix

Status: Implemented, verified (`71 passed`), and deployed to `https://demo0ps.github.io/SheetQMS/` at commit `aaee6b0` (2026-10-14).

1. **Client-Side Universal `.xls` + `.xlsx` Reader (`web/app.ts`):**
   - Integrated SheetJS (`xlsx`) + HTML-table `.xls` DOMParser fallback in `parseUploadedFile(file)` so legacy Excel 97–2003 binary `.xls` (OLE2 BIFF8/BIFF5), SA-SAMS/Pastel HTML-table `.xls`, SpreadsheetML XML `.xls`, `.xlsx`, and `.csv` files parse cleanly in the browser.
   - Added a binary-file guard before CSV text fallback and automatic cleanup of any corrupted `.xls` state in `localStorage`, plus an in-memory state cache (`memStaticState`) so large workbooks never fail on `localStorage` quota limits.
2. **Post-Upload `studio()` Null-Guard Fix (`web/app.ts`):**
   - Added null guards (`if ($('run-job'))`, `if ($('confirm-correction'))`, `if ($('download-output'))`) in `studio()` so auto-released uploads (where `#run-job` is hidden) never throw a `TypeError` when binding event listeners.
   - Updated all file inputs (`accept=".xlsx,.xls,.csv"`) and folder batch filters (`/\.(xlsx|xls|csv)$/i`) to include `.xls`.
3. **Backend `.xls` Support (`sheetqms/workbooks.py` & `sheetqms/online.py`):**
   - Added `xls_rows(path)` supporting binary BIFF8/BIFF5 `.xls` (via `xlrd`), HTML-table `.xls`, SpreadsheetML XML 2003 `.xls`, `.xlsx`-renamed-to-`.xls`, and TSV/CSV `.xls`, and enabled `.xls` across `/api/jobs` and `/api/jobs/batch-folder`.

## D-036 — School Template Mapping Fix: Repeated Learner/Parent Header Disambiguation, Multi-Parent Coalescing, Strict Academic Subject Filter & Fast 200-Row Preview

Status: Implemented, verified (`71 passed`), and deployed to `https://demo0ps.github.io/SheetQMS/` at commit `bcf962f` (2026-10-14).

1. **Header Row Detection & Repeated Learner/Parent Header Disambiguation (`pickHeaderIndex` & `matrixToTable` in `web/app.ts`, `candidate_headers` in `sheetqms/workbooks.py`):**
   - Removed the strict `uniq.size !== textCells.length` filter and `'date'` prefix penalty that previously caused `pickHeaderIndex()` to skip real school header rows (which contain `Date of Birth` and repeated `Name`, `Surname`, `Email`, `Cell` headers across Learner, Father/Parent 1, and Mother/Parent 2) and pick Learner #17 (`17, BALOYI, Siyabonga...`) as the column headers.
   - Added strong data-row penalties (`-14` per cell for emails `@`, phone numbers `069...`, `'Grade 12'`, `'12 C'`, `'M'`/`'F'`, dates, and leading row numbers) and header-keyword boosts (`+6` per cell).
   - Added automatic disambiguation for repeated column headers in `matrixToTable()` (mapping 2nd/3rd occurrences of `Name`, `Surname`, `Email`, `Cell`/`Phone` to `Parent First Name`, `Parent Last Name`, `Parent Email`, `Parent Phone`) and headerless-sheet column inference when Row 0 is already data.
2. **3-Tier Template Column Matcher + Multi-Parent Row Coalescing (`localApi('/api/jobs')` in `web/app.ts`):**
   - Added Tier 1 (Expanded synonyms), Tier 2 (Keyword/substring matching), and Tier 3 (Data-content pattern matching across rows) plus automatic row-by-row coalescing across Parent 1 / Parent 2 columns so rows where Parent 1 is blank automatically pull Parent 2 (`Adelaide Fanisa`, `Twala`, `0730756884`).
   - Restricted horizontal `Subjects` matrix collapsing (`ACADEMIC_SUBJECT_RE`) to real academic subject names so unmapped learner/parent columns are never stuffed into `Subjects`.
3. **Immediate Release & Fast 200-Row Live Preview (`evaluateCustomJob` & `studio` in `web/app.ts`):**
   - Stopped locking multi-row imports on blank optional cells (`Subjects`, `Parent Email`) and eliminated yellow `Ask in chat` badge spam on normal tables.
   - Added a fast 200-row live DOM preview cap (with a `Show All N Rows` toggle button) so 3,831-row workbooks render instantaneously while exporting 100% of rows on `Download Excel (.XLSX)`.

## D-037 — SA-SAMS / GDE 2-Sheet Learner-Parent Bio + Internal School Mark Schedule Join Fix

Status: Implemented, verified (`71 passed`), and deployed to `https://demo0ps.github.io/SheetQMS/` at commit `22c0f95` (2026-10-14).

1. **Single-Parent Unit Selection (`take 1 parent, whichever is available eith father or mother`):**
   - On SA-SAMS / GDE Learner & Parent Info sheets (`Number | Surname | First Name | Gender | Grade | Class | Cell# | Name | Surname | Cell# | Name | Surname | Cell#`), disambiguated columns by semantic role (`FIRST_NAME`, `LAST_NAME`, `PHONE`, `EMAIL`) into `First Name`, `Last Name`, `Learner Phone`, `Parent 1 First Name`, `Parent 1 Last Name`, `Parent 1 Phone`, `Parent 2 First Name`, `Parent 2 Last Name`, `Parent 2 Phone`.
   - For each learner row, selected **1 single parent as a unit** (Father / Parent 1 if Father has a name on that row, else Mother / Parent 2) into `Parent First Name`, `Parent Last Name`, `Parent Phone`, and `Parent Email`, so Father and Mother fields are never cross-mixed (e.g., when Father is blank and Mother is `Johannah | APHANE | 0714364266`, `Parent Last Name` is `Aphane`, never Father's blank surname).
2. **GDE Mark Schedule Header Detection, `Learner Name` Splitting, `(Gr 10)` Subject Stripping & SA ID DOB Extraction:**
   - Expanded `pickHeaderIndex()` / `candidate_headers()` to scan up to 35 rows and detect Row 12 headers below GDE school banners without penalizing wide header rows containing multi-line comment headers (`Codes: P (Achieved)... Report General Comment`).
   - Automatically split combined `"SURNAME, FirstName, MiddleName"` (`"APHANE, Thato, Bonolo"`) in `Learner Name` into `Last Name` (`"Aphane"`) and `First Name` (`"Thato Bonolo"`).
   - Extracted `Date of Birth` (`YYYY-MM-DD`) automatically from the first 6 digits (`YYMMDD`) of 13-digit (or 11–12 digit zero-padded) `Accession Number` / SA ID (`0905245292081` $\rightarrow$ `2009-05-24`), and extracted `Grade` (`Grade 10`) from `For: Grade 10` banner rows or `(Gr 10)` subject headers.
   - Stripped `(Gr 10)` / `(Grade 10)` suffixes from subject column headers (`Accounting (Gr 10)` $\rightarrow$ `Accounting`) while excluding summary/comment columns (`Learner Average (All subjects)`, `Learner Rank`, `Learner Total`, `Code`, `Report General Comment`, `Deviation Comment`).
3. **Cross-Sheet Bio + Mark Schedule Join (`keep_all_bio_learners`) & Staged Multi-File Upload:**
   - Ordered multi-sheet joins so Bio sheets run first (keeping all learners across all grades) and Mark Schedule sheets run second.
   - Prevented joining across sheets on sequential row counters (`Number = 1, 2, 3...`), matching instead on 6+ char `Accession Number` / SA ID or `Last Name + First Name` (exact match first, then `lastName|firstGivenName` such as `"aphane|thato"` $\leftrightarrow$ `"aphane|thato bonolo"` with Grade tiebreaker) and upgrading `Student ID` from row counter to `Accession Number`.
   - Added multi-click file staging (`stagedSources`) and complementary school-sheet auto-joining in the upload drawer so users can pick their 2 `.xls` files either together at once or one after another.

## D-038: Strict Grade + Gender + 1-to-1 Lock on Bio + Mark Schedule Joins, and Excluding Bio Language Columns from `Subjects` Matrix (2026-10-14)
- **Owner-Confirmed Decisions (`ask_user`):**
  1. `strict_grade_join_rule`: **`strict_grade_and_gender_lock`** — Only match a Grade 10 Mark Schedule row to a Bio learner who is also in Grade 10 (plus matching Gender `M`/`F`). Never put Grade 10 FET subjects (like `Business Studies`) or DOB onto Grade 8, 9, 11, or 12 learners who share the same name.
  2. `unmatched_mark_schedule_learners`: **`append_as_grade10_if_not_in_bio`** — If a Grade 10 learner is on the Mark Schedule but not found in Grade 10 on the Bio sheet, append them as a Grade 10 row at the bottom (never attach them to a Grade 8/9/11/12 learner).
  3. `grade_8_9_subjects_source`: **`caps_senior_phase_9_subjects`** — Auto-fill the standard 9 compulsory CAPS Senior Phase subjects for all Grade 8 and Grade 9 learners (`Sepedi Home Language; English First Additional Language; Mathematics; Natural Sciences; Social Sciences; Technology; Economic and Management Sciences (EMS); Life Orientation; Creative Arts`, dynamically using the learner's or school's Home Language and First Additional Language when specified).
- **Implemented across `web/app.ts` (`web/app.js`), `sheetqms/engine.py`, and `tests/test_online.py`:**
  1. **Strict Grade + Gender + 1-to-1 Lock (`findBestNameMatch` / `_pick_candidate`):**
     - Enforced hard Grade lock (`if (objGr && cGr && cGr !== objGr) return false`), hard Gender lock (`if (objGen && cGen && cGen !== objGen) return false`), and 1-to-1 match lock (`if (isMarksSheet && meta?.matchedMarks) return false` / `matched_marks_idxs`) so a Grade 10 Mark Schedule row can never overwrite a Grade 8, 9, 11, or 12 learner (or a second learner with the same name).
     - Appended any unmatched Grade 10 Mark Schedule learners at the bottom as `Grade 10`.
  2. **Standard 9 CAPS Senior Phase Subjects Auto-Fill for Grade 8 & Grade 9 (`_fill_caps_senior_phase`):**
     - Whenever a learner's `Grade` is `Grade 8` or `Grade 9` and no Grade 8/9 Mark Schedule subject list is present on that row, `Subjects` is automatically populated with the 9 compulsory CAPS Senior Phase subjects: `<Home Language>; <First Additional Language>; Mathematics; Natural Sciences; Social Sciences; Technology; Economic and Management Sciences (EMS); Life Orientation; Creative Arts`.
  3. **Excluded Bio-Sheet Language Columns from `Subjects` Matrix (`isBioParentSheet` / `is_bio_parent_sheet`):**
     - Excluded generic Bio language-preference headers (`Home Language`, `First Additional Language`, `Second Additional Language`, `Language of Learning and Teaching`, `Preferred Language`) and Bio sheets (`Parent 1 *` / `Parent 2 *` without `(Gr X)` headers) from `candSubj` / `cand_subj`, ensuring the `SUBJECTS` header dropdown always points to the Mark Schedule subject matrix (`← [Matrix: Accounting (Gr 10), Business Studies (Gr 10), ...]`).

## D-039: Blank `Parent Email` on Bio Sheets, Full Bio `Birth Date` / `Date of Birth` Preservation Across All Grades, and No Same-Sheet Learner Merging (2026-10-14)
- **Owner-Confirmed Decisions (`ask_user`):**
  1. `nonexistent_emails_seen`: **`other_rows_or_fabricated_emails`** (`"flexerworldwide@gmail.com"`); `parent_email_rule_on_bio`: **`no_parent_email_keep_blank`** — The Bio `.xls` sheet has NO Parent Email column at all; `Parent Email` must remain completely blank for all rows on the Bio sheet (never map a learner's own `Email` column or another row's email into `Parent Email`).
  2. `missing_dob_learners`: **`grade_8_9_11_12_learners`**; `grade_8_9_dob_location`: **`in_bio_sheet_column`**; `bio_sheet_dob_header_name`: **`birth_date_or_dob_col`**; `bio_dob_values_check`: **`all_learners_have_dob_in_bio`** — Every learner (across Grades 8–12) has a `Birth Date` / `Date of Birth` / `DOB` column filled in on the Bio `.xls` sheet; all learners must retain their `YYYY-MM-DD` Date of Birth from the Bio sheet.
- **Root Causes Identified & Fixed across `web/app.ts` (`web/app.js`), `sheetqms/workbooks.py`, `sheetqms/engine.py`, and `tests/test_online.py`:**
  1. **Stopped Copying `Learner Email` into `Parent Email` & Disambiguated Generic `Email` on Bio Sheets:**
     - Removed the `|| obj['Learner Email']` fallback on lines 2374–2384 of `web/app.ts` and restricted `Parent Email` on `hasParentBlocks` / `bio_parents` sheets to explicit parent email columns (`hasExplicitParentEmails`).
     - Treated single generic `Email` columns on 2-parent Bio sheets (`firstParentColIdx < 999`) as `'Learner Email'` rather than `'Parent 1 Email'`, and removed `'learner email'` / generic `'email'` from `'parent email'` synonyms so `'Parent Email'` remains completely blank (`null`) when a Bio sheet has no Parent Email column.
  2. **Fixed Duplicate-Header Overwrite (`baseHeaders.forEach`) & Multi-Format `.xls` `Birth Date` / `Date of Birth` Normalization:**
     - Fixed `matrixToTable` in `web/app.ts` (and `_normalize_school_sheet_rows` in `sheetqms/workbooks.py`) to populate row dictionaries using deduplicated `baseHeaders` instead of `rawHeaders`, and disambiguated repeated DOB columns (`Date of Birth` for the learner vs `Parent 1/2 Date of Birth` inside parent blocks) so a secondary blank DOB column never overwrites the learner's `Date of Birth` with `null`.
     - Added `normalizeDateValue` / `_normalize_date_str` and dual `raw: true` + `raw: false` (`fmtMatrix`) SheetJS cell extraction supporting `Date` objects (`+12h` timezone-safe), Excel serial date numbers (`20000..50000`), `YYYY-MM-DD`, `DD/MM/YYYY`, `DD/MM/YY`, month-name dates (`"14 May 2011"`, `"18-Nov-2012"`), compact `YYYYMMDD`, and 10–13 digit SA IDs, plus a row-level learner DOB/SA-ID fallback scan across all Grades 8–12.
  3. **Prevented Same-Sheet Learner Merging (`meta?.sourceIdx === pIdx`) & Added Cross-Sheet Given-Name Token Fallback:**
     - Added `sourceIdx: pIdx` to `rowMeta` and enforced `if (meta?.sourceIdx === pIdx) return false` inside `findBestNameMatch` so two learners on the Bio sheet who share a surname, first given name, grade, and gender are never merged into one row.
     - Added `bySurname` / `by_surname` cross-sheet fallback (requiring matching Surname, Grade, Gender, 1-to-1 lock, and at least one shared given-name token) and bumped `localStorage` state key to `'sheetqms_static_state_v6'`.

## D-040: Stacked Multi-Section Table Splitting (Line 1800+ Going Down) & Unified Single-Master-Row Learner Profile Merger (2026-10-14)
- **Owner-Confirmed Decisions (`ask_user`):**
  1. `section_from_line_1800_layout`: **`stacked_second_table_in_same_sheet`** — Inside the same spreadsheet, below row ~1800, another table/section starts (with its own headers/columns) containing extra details for the same learners listed at the top.
  2. `fields_found_below_1800`: **`all_missing_pieces_across_sections`** — Different sections/sheets each hold a piece of the learner's profile (`Date of Birth`, `SA ID / Accession Number`, `Subjects`, `Parent` details, `Grade`).
  3. `master_sheet_row_limit_and_merge_rule`: **`one_row_per_unique_learner_fill_gaps`** — Keep strictly 1 row per unique learner (bounded to the actual number of learners on the spreadsheet, e.g. ~1,800), pulling missing fields from line 1800+ and across all sheets into that learner's single master row.
  4. `matching_key_for_1800_down`: **`match_by_name_grade_or_id`** — Match by `Surname + First Name` (with `Grade`/`Gender` when available), or by `SA ID / Accession Number` when present.
- **Implemented across `web/app.ts` (`web/app.js`), `sheetqms/workbooks.py`, `sheetqms/engine.py`, and `tests/test_online.py`:**
  1. **Automatic Stacked-Table / Mid-Sheet Section Splitter (`splitMatrixIntoSections` / `_split_and_normalize_sheet_sections`):**
     - Scans the entire worksheet (beyond the top header row, including line 1800+ going down) for any mid-sheet table header rows (`isMidSheetHeaderRow` / `_is_mid_sheet_school_header_row`) and preceding banner rows (`isBannerOrMetadataRow` / `_is_banner_or_metadata_row`), plus multiple `<table>` elements in HTML `.xls` files.
     - Splits each stacked section into its own table (`Sheet1`, `Sheet1 (Section 2)`, etc.) so each section is parsed with its own header row, its own `bannerGrade`, and its own column mapping rather than being misread under Row 1's columns.
  2. **Row-Level Field Recovery (`Class -> Grade`, Shifted `SURNAME, FirstName`, 10–13 Digit SA ID & DOB):**
     - Automatically infers `Grade` (`Grade 8`..`Grade 12`) from `Class` codes (`8A`..`12Z`) when `Grade` is blank, recovers `Accession Number` and `Date of Birth` from any non-parent cell on the row, and splits shifted `"SURNAME, FirstName"` cells when `First Name` / `Last Name` are empty.
  3. **Unified Relational Master-Row Merger (`parsedSources.length > 1 || isSchoolLearnerJob`) & Non-Learner Row Filter:**
     - Runs the deduplicating relational merger across all sections and sheets (even within a single uploaded file), merging any matching learner from line 1800+ or secondary sheets into their single Master Row at the top (`byRealId`, `byExactName`, `byShortName`, `bySurname`, and `byRowNumSurname` fallback).
     - Filters out non-learner banner, summary, total, average, and footer rows (`isValidPersonName` / `_is_valid_person_name`) so the Master Sheet stays strictly bounded to the actual learners on the spreadsheet.
     - Bumped `localStorage` state key to `'sheetqms_static_state_v7'`.

## D-041: Grade 8 & 9 6-Digit `YYMMDD` Date of Birth Extraction & Uniform Counting Batch `Student ID` (`STU0001..STU1800`) (2026-10-14)
- **Owner-Confirmed Decisions (`ask_user`):**
  1. `student_id_stu_format`: **`stu0001_no_hyphen_4digits`** — Format `Student ID` across all learners as a uniform auto-generated counting batch (`STU0001`, `STU0002`, ..., `STU1800`, 4 digits with leading zeros, no hyphen) so `Student ID` never mixes short numbers (`1, 2, 3...` or 6-digit `121007`) on Grades 8 & 9 with 13-digit SA IDs on Grades 10–12.
  2. `dob_output_format_from_yymmdd`: **`convert_yymmdd_to_yyyy_mm_dd`** — Convert 6-digit `YYMMDD` values in the Mark Schedule for Grade 8 & 9 (e.g. `121007` $\rightarrow$ `2012-10-07`, `120218` $\rightarrow$ `2012-02-18`, `111103` $\rightarrow$ `2011-11-03`, `130624` $\rightarrow$ `2013-06-24`) and 13-digit SA IDs for Grades 10–12 into standard `YYYY-MM-DD` in the destination `Date of Birth` column.
  3. `grade_8_9_mark_schedule_location`: **`multi_tabs_or_sections_in_mark_schedule`** — Support Mark Schedule workbooks with multiple tabs or stacked sections across Grades 8–12 (including Grade 8 & 9 Mark Schedule sections where Column B is titled `"Date of Birth"` or `"Accession Number"`).
- **Implemented across `web/app.ts` (`web/app.js`), `sheetqms/workbooks.py`, `sheetqms/engine.py`, and `tests/test_online.py`:**
  1. **6-Digit `YYMMDD` (`121007` $\rightarrow$ `2012-10-07`) & 5-Digit Zero-Stripped `YMMDD` (`90524` $\rightarrow$ `2009-05-24`) Date of Birth Parsing:**
     - Updated `extractDobFromSaId` and `normalizeDateValue` in `web/app.ts`, `_extract_dob_from_sa_id_str` and `_normalize_school_sheet_rows` in `sheetqms/workbooks.py`, and `validate_and_repair_sa_id` in `sheetqms/engine.py` to parse 6-digit `YYMMDD` (`\d{6}`) and 5-digit zero-stripped `YMMDD` (`[5-9]\d{4}`) into `YYYY-MM-DD` (`{ id13: null, dob: 'YYYY-MM-DD' }`).
     - Updated `_normalize_school_sheet_rows` (`mode == 'gde_marks'`) so Grade 8 & 9 Mark Schedule headers where Column B is titled `"Date of Birth"` (rather than `"Accession Number"`) are recognized and normalized into `YYYY-MM-DD`.
     - Updated `isRealId` / `_is_real_key` to require `>= 10` digits for numeric cross-sheet IDs so 6-digit `YYMMDD` birthdays are never treated as unique Student IDs.
  2. **Uniform Auto-Generated Counting Batch `Student ID` (`STU0001..STU1800`):**
     - After merging all sections/sheets and extracting `Date of Birth` from any 6-digit `YYMMDD` or 13-digit SA ID, assigns sequential `STU0001`, `STU0002`, ..., `STU1800` (`STU${String(rIdx + 1).padStart(4, '0')}`) across all learner rows (`localStorage` key bumped to `'sheetqms_static_state_v8'`).

















