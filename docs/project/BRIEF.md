# Brief: SheetQMS spreadsheet transformation tool

Updated: 2026-10-13
Phase: v0.2 online/serverless customer workspace and guided QMS chat verified in development; live cloud deployment and real-data acceptance open.

## Confirmed goal and scope

Build a new, focused local application that populates varying destination templates from messy spreadsheet sources, including structural row-to-column transformations. Rules live in the workbooks. Automated QMS controls output release and asks for clarification when needed.

Only these functions are in scope: import and inspect, extract rules, propose mappings, clarify, transform, validate, export, maintain scoped knowledge, and configure the necessary AI connection. No general chatbot, CRM, unrelated automation or extra business system.

The owner has no real data yet and authorised proceeding with an intelligent foundation. Use synthetic workbooks with known expected results; do not claim production accuracy from them.

## Latest confirmed decisions

- Destination templates vary by job/client.
- Authoritative rules are embedded in the workbooks.
- QMS coordination and normal passing-output release are automated; uncertain or failed jobs are held.
- The application runs locally on the owner's computer with a browser interface.
- External AI API processing is now permitted. This explicitly supersedes the earlier strict-containment choice: any workbook content included in inference requests leaves the computer. It is not zero-data-transfer.
- Workbook/saved-knowledge rule conflicts are held for clarification, not silently prioritised.
- Reusable mappings are saved automatically only after QMS passes, scoped to template version and source layout.
- Settings must allow the owner to configure API access privately. Do not request keys in chat.

## First-version architecture

Local Python service, browser UI, SQLite state and append-only audit events, openpyxl workbook handling, typed mapping contracts, and controlled transformations. Open-source local dependencies; no hosted service required.

Three screens: Transform, Rules & Knowledge, Settings.

AI proposes a typed plan. The deterministic engine executes supported operations and QMS gates release. Initial adapters: OpenAI-compatible chat completions and Anthropic message format. No provider or model has been chosen and no live key supplied. Other native formats are out of scope until requested.

Cost routing: free layout/rule recognition and exact-scoped knowledge reuse first; explicit paid AI analysis second; no automatic expensive retries or premium escalation. Budget defaults to zero, AI paused. Provider/model pricing must be verified before enabling requests. App reservations use configured prices; an account-wide provider cap is still required because the app cannot control other usage or incorrect rate configuration.

## Pipeline and quality requirements

1. Preserve original imports and inspect actual sheets, regions, headers, values, formulas and embedded instructions.
2. Extract supported authoritative rules; mark unsupported or ambiguous instructions for clarification.
3. Propose or reuse a structured plan with actual source IDs, sheet names, header rows and field bindings.
4. Support long rows, wide tables, matrix row-to-column reshaping, direct field mapping and A-label/B-value text-form rows into column fields. No arbitrary generated code or macro execution.
5. Transform reproducibly using Decimal arithmetic for numeric operations; never invent a missing zero or guess a number locale.
6. Check mapping coverage, required fields, supported workbook features, source/output reconciliation, applicable rules, rule conflicts, and export round-trip.
7. Gate the final workbook through automated QMS. Any required failed gate or unresolved question prevents download.
8. Only after release, save the structural mapping and rule knowledge. Do not save raw source rows, API keys or fabricated defaults in the knowledge library.

Known-correct synthetic outputs are test evidence for supported cases, not proof that arbitrary unknown business meaning is correct. "Perfect" remains an acceptance objective to be grounded in real rules and examples later.

## Knowledge and clarification policy

Core immutable controls cannot be overridden by workbook text or AI. Rule versions and template/input-layout fingerprints scope learned mappings. Changed rules in an otherwise matching template family require explicit clarification. Clarification answers and operator-confirmed structured plans are audited. A recorded free-text answer alone does not make missing data valid.

## Data and credentials

Local originals, outputs and audit data remain on the computer. Explicit AI analysis may send workbook metadata, sample cells and rules to the configured provider. Provider retention/training terms have not been verified because no provider/model is selected.

Keys pasted in local Settings remain in server memory for the current run, not browser storage, settings database, source control, reports or logs. An optional operator-owned process environment key is supported. The cloud preview is synthetic-only: real keys and live AI calls are disabled there.

For this chat, share only synthetic or explicitly approved non-sensitive examples. Do not upload confidential originals or keys.

## Assumed defaults / version boundaries

| Default | Value | Switch / location | Replace when |
|---|---|---|---|
| Provisional internal tool name | SheetQMS | UI / package label | Owner selects a name. |
| Local runtime | Python 3.11+ and browser; loopback by default | launcher host default 127.0.0.1 | Owner requests another controlled deployment. |
| Supported files | .xlsx template; .xlsx and UTF-8 .csv sources | workbook parser format allowlist | Representative files justify a verified additional format. |
| File limits | 20 MiB/file, 50 MiB/batch, 10 sources; 20k rows/sheet, 200 columns, 1M cells/workbook | parser and import limits | Actual workload requires measured changes. |
| Normalization/output limits | 50k normalized records; 20k output rows and 1M output cells | engine capacity guards | Measured workloads justify an approved increase. |
| Budget accounting month | UTC, integer USD microdollars | spend ledger | Selected provider billing policy justifies another verified period. |
| Row-label form operation | One logical record/sheet; labels A, values B; no formula-valued form cells | cells source layout | Real forms justify additional verified operations. |
| AI state and spend | Paused; USD 0 monthly budget | settings.enabled=false; monthly_budget_usd=0 | Owner chooses provider/model, verifies prices and authorises budget. |
| Key persistence | Session-only server memory | key holder / optional process environment | Owner approves a secure persistent credential store. |
| Source mutation | Never overwrite original imports | separate output file | A separately approved safe workflow requires otherwise. |
| Destination writing | Explicit embedded write_mode=replace | template config | Verified append/multi-region support is designed. |
| Rule grammar | Structured ID/Type/Fields/Value rows or supported declarative instructions; unknowns held | rule compiler | Real examples justify more supported rules. |
| Formula calculation | Allowlisted arithmetic and rectangular SUM with checked cached export values | safe formula evaluator | Additional verified Excel operations are required. |
| Knowledge reuse | Exact template version and source-layout match; conflicts ask | family/version/input fingerprints | Owner approves a different, tested policy. |

## Still unconfirmed

Provider/model, real spreadsheet layouts and rule content, workload, operating system, budget, retention/access policy, and production correctness criteria. These do not prevent a synthetic prototype, but do prevent claiming production readiness or live AI verification.


## Latest requested evolution — internet/serverless

Supersedes the local-only target above: build an authenticated internet application with a modern tech workspace and QMS chat. Settings move to an admin dashboard; which non-secret settings users may see/edit, and whether keys are shared or user-owned, require clarification. Workbook processing, rules and knowledge remain the sole application purpose. Real cloud deployment, authentication, isolated data, persistent job state, protected secrets and cost controls must be built and tested; running the current preview is not serverless deployment. Blocking questions resolved on 2026-10-13: separate customer accounts, user non-secret preferences with platform-admin-only credentials/budgets, private cloud job history, and budget amounts created in the admin dashboard (initial USD 0). Do not request real keys in chat.
