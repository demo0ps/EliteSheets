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



