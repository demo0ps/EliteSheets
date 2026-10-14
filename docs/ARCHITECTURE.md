# v0.2 internet/serverless architecture

## Owner choices, 2026-10-13

- Separate customer accounts and isolated files, QMS chat and knowledge.
- Private cloud job history, not browser-only file retention.
- Users may edit permitted non-secret preferences; shared keys/models/budgets stay with the **platform admin (owner only)**.
- Budget amounts are created in the admin dashboard. No numerical purchase/deployment allowance was supplied, so initial limits remain **USD 0**, AI disabled.
- Workbook authority, held conflicts, QMS auto-release after passing and post-pass scoped learning remain active.

## Implemented boundary

Static, compiled TypeScript browser workspace + stateless Python HTTP API. Every request reads shared durable job/session/config state. Workbook scratch files are recreated from private objects in a per-request temporary directory, then discarded. No production SQLite or original-upload directory is accepted.

The production adapters are **PostgreSQL** for accounts, sessions, job metadata, conversations, immutable events/knowledge and cost reservations; **private R2** for workbook blobs; **Fernet** with a stable cloud-secret encryption key for write-only AI credentials. A development SQLite/local-blob adapter is used only in synthetic testing.

Platform admin can create invite-only customer/operator accounts, select a workspace for support, set models/prices/allowances/quotas and control shared credentials. Customers cannot call admin APIs, spoof workspace headers or read another customer's IDs. Passwords use salted scrypt; sessions are hashed in the database. Production cookies are Secure/HttpOnly. Mutations require a session CSRF token. The synthetic iframe demo has an in-memory-only demo header token; that bypass is disabled outside demo mode.

## QMS conversation

Chat is job-specific, stored with the customer job and escapes workbook/chat text in the browser. Guided chat can explain QMS findings, run checks, resolve a recorded rule conflict, propose an explicit missing pivot fact or a direct field-binding correction. A proposal needs confirmation before it changes the job. Operator-supplied facts are a new audited source, never an invented default or mutation of the old originals. Confirmation reruns actual QMS. Unsupported language is recorded with honest follow-up, not a fabricated interpretation. Broad language interpretation needs an admin-configured, budgeted, consented external AI analysis.

The pure spreadsheet engine remains separate from language interpretation. No arbitrary generated code, macros or confidence-based approval. The existing supported-feature limitations remain; this is not a universal Excel interpreter.

## Coordination and limits

Database-backed per-job leases protect mutation across serverless instances. Tenant/request uniqueness gates intake replay. Confirm/chat request IDs prevent duplicate effects. Platform AI reservations lock the shared config row and use integer microdollars; zero budget blocks before network. Customer quota checks lock the customer row and sum durable stored bytes/job counts, not the recent-job page. Audit events and knowledge cannot update/delete; active knowledge heads are mutable only through audited operations.

No background thread queue is used for paid/model or transformation jobs. Work happens inside the bounded HTTP request. Start with one vCPU, request concurrency 1, request timeout 300s and a small max-instance limit. Larger tasks need an explicit durable queue/job runner and verified workload measurements before increasing the file/record bounds.

## Hosting proposal / ADR-002

**Proposed deployment:** Cloud Run request-based, min instances 0; PostgreSQL (a scale-to-zero provider such as Neon), private R2. This preserves the already tested Python workbook engine rather than force it into a constrained edge-WASM runtime. The deployment recipe is provided; **no owner cloud account was provisioned and no production deployment was executed**.

Cloud Run is serverless managed compute even though this package is a container image. It is not an always-on VPS. Static assets can later move to an edge CDN if traffic justifies it. A paid dependency/tier is triggered only by owner-authorised budgets, measured CPU/storage/traffic exceeding free limits, and a reviewed ADR—not automatically by signup or a user's chat.

Official pages checked 2026-10-13:
- https://developers.cloudflare.com/workers/platform/limits/ — free CPU 10ms/request and isolate RAM 128MB; unsuitable as an assumed full workbook-engine drop-in.
- https://developers.cloudflare.com/workers/languages/python/packages/ — package compatibility must be checked; native WebAssembly packaging remains a constraint.
- https://cloud.google.com/run/pricing — request-based free allowances, region/billing-account aggregation and outbound transfer charges. This is not a zero-total-bill guarantee.
- https://neon.com/pricing — current Free plan shows 1GB PostgreSQL storage/project, 100 CU-hours/project and scale-to-zero after 5min; do not reuse conflicting older blog figures. Production support/availability is not guaranteed by a free tier.
- https://developers.cloudflare.com/r2/pricing/ — Standard storage free allowance 10GB-month, 1M Class A/10M Class B operations, zero egress charges; paid storage/operations still exist.

No AI provider/model prices are quoted or configured. Hosting planning ceiling is an admin-controlled planning value, **not a provider-enforced hard cloud-spend cap**. Set account-wide provider limits/alerts and usage/storage quotas independently.

## Open production acceptance

Actual hosted PostgreSQL/R2 compatibility, cold starts, failure cleanup/recovery, real phone/customer devices, TLS public URL, real business data and golden results, storage location/retention legal policy, live AI provider/terms/prices, email delivery/reset/verification and broader security review remain open. Do not claim this preview is a fully deployed production service.
