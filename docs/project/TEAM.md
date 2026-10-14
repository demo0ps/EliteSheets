# Development team charter

**Status:** Proposed expansion. The team operating model is confirmed; this roster and workflow await owner approval.

**Date:** 2026-10-12

## 1. Purpose

Operate as a coordinated development team with specialist responsibilities, a shared goal, explicit handoffs, and a reliable written project state.

The improvement is not simply more role names. Each active role must produce a useful artefact, check, or decision. Small tasks should not require every specialist.

The owner sets the goal and approves major changes, spending, credentials, and client-facing claims. The team researches, proposes, implements, checks, and documents within those boundaries.

## 2. Specialist roster

| Role | Responsibility | Expected output |
|---|---|---|
| Team lead / delivery coordinator | Keep scope, priorities, dependencies, handoffs, and current state aligned. Resolve disagreements or escalate them to the owner. | Plan, task ownership, current status, and next action. |
| Product / business analyst | Turn the owner's goal into user journeys, requirements, non-goals, and measurable acceptance criteria. Identify unanswered questions. | Brief and acceptance criteria; blocking questions and recorded defaults. |
| Solution architect | Design boundaries, typed contracts, data flow, and trade-offs without unnecessary complexity. | Architecture outline, interface contracts, and architecture decision records. |
| UX / accessibility specialist | Design usable flows, error recovery, keyboard interaction, and accessible content structure. | Flow designs, accessibility requirements, and usability findings. |
| UI / brand designer | Translate the confirmed brand profile into consistent visual design. Respect image, logo, and third-party boundaries. | Design tokens, component specifications, and asset provenance. |
| Frontend engineer | Implement responsive interfaces, client-side state, loading and failure behaviour, and API consumption. | Working UI with appropriate tests and browser evidence. |
| Backend / integrations engineer | Implement APIs, permissions, integrations, idempotent actions, and verified, replay-safe webhooks. | Typed service contracts, implementation, and integration tests. |
| Data engineer | Protect data integrity, concurrency, migrations, event history, and query efficiency. | Schema, migration and recovery plans, and integrity tests. |
| Security / privacy reviewer | Review access controls, threat scenarios, secret handling, retention, consent, and applicable privacy requirements. | Risk findings and required safeguards; explicit unresolved issues. |
| QA / test engineer | Test acceptance criteria, regressions, failure paths, duplicate requests, and the actual environment in scope. | Reproducible results tied to the tested version; gaps and defects. |
| Release / reliability engineer | Manage build and publish steps, configuration, observability, deployment checks, and rollback or recovery. | Release evidence, operational notes, and recovery procedure. |
| Cost / performance reviewer | Verify current provider pricing, expected usage, budgets, caps, graceful degradation, and performance bottlenecks. | Cost-impact statement, measurements, and an ADR for any paid tier. |
| Content / documentation specialist | Keep copy, claims, task handoffs, setup instructions, and project records accurate and usable. | Verified copy, source references, updated records, and handover notes. |

### Activation rule

Select the smallest useful set of roles for each task. Not every role is active on every task.

Examples:
- A copy correction may need content, frontend, and a verification pass.
- A layout change may need UX, UI, frontend, and QA.
- Payments or stock changes require backend, data, security, and QA review, with release and cost review where affected.

These are specialist responsibilities and work passes. A role label is not evidence that a separate person or autonomous agent ran it. Record actual execution accurately. Do not describe a role-based self-review as an independent review.

## 3. Stronger working process

### A. Make work ready before starting

A task needs:
- A link to the current goal.
- Scope and explicit exclusions.
- One accountable owner role and the necessary reviewer roles.
- Observable acceptance criteria.
- Known dependencies, risks, and approvals.
- Blocking questions identified; non-blocking defaults recorded.

Do not invent a product goal, client, budget, deadline, or deployment target.

### B. Plan failures before implementation

For the relevant feature, ask what happens when connectivity fails, permissions are wrong, data is missing, an external service is unavailable, or the same request arrives twice. Record the expected behaviour and test it.

Apply the existing profile's rules for integer money, idempotency, append-only state events, atomic availability, typed contracts, trace IDs, and verified webhooks.

### C. Separate build and review passes

The implementation pass produces the change and its evidence. The review pass examines the actual files, behaviour, and test results against the acceptance criteria, rather than accepting a summary.

Assign a challenger during review: look specifically for incorrect assumptions, unnecessary complexity, hidden cost, security gaps, and false completion claims. This is a review responsibility, not an extra standing role.

Record whether review was role-based or independently executed. Neither arrangement guarantees correctness.

### D. Use evidence-based status

Use a simple progression: PROPOSED -> READY -> IN PROGRESS -> IN REVIEW -> VERIFIED DONE. Mark BLOCKED wherever progress cannot safely continue.

Built is not the same as tested. Tested locally is not the same as verified live. Passing a headless check is not proof of a real-device check.

Each verification entry records the checked version or artefact, environment, command or method, result, and remaining gaps. Never report a check as passed unless it actually ran.

The original profile's Definition of Done remains the baseline. If a required check cannot run, record the gap and do not silently waive it.

### E. Preserve a useful handoff

Every meaningful step updates the current state. A handoff must say:
- Goal and task.
- What changed and where.
- Why the decision was made.
- What was checked and what was not.
- Known risks or blockers.
- The next action and responsible role.

A fresh session or future developer should be able to resume from the records without reconstructing the entire chat.

### F. Keep approvals and questions disciplined

Discuss major redesigns and big changes before implementation. Escalate spending, sensitive access, irreversible actions, and unsupported client claims to the owner.

Ask only genuine ambiguities, in batches of at most 3 to 4. Label questions BLOCKING or NON-BLOCKING. Record assumed defaults and their configuration switches where applicable.

## 4. Lean shared records

Start with these records; split out more files only when the project needs them:

| Record | Purpose |
|---|---|
| TEAM.md | Responsibilities, review routing, handoffs, and escalation rules. |
| STATUS.md | Current goal, phase, work, verification, risks, blockers, and next steps. Initially also holds the short backlog. |
| DECISIONS.md | Confirmed decisions, proposed decisions, reasons, and superseded choices. |
| Project brief, once agreed | Product goal, scope, priorities, acceptance criteria, constraints, and assumed defaults. |
| Client brand profile, once supplied | Client-specific facts, permitted assets, claims, boundaries, and test widths. |

Move the backlog into TASKS.md or verification evidence into a separate log only when that improves clarity. Avoid duplicate sources of truth.

### Task card

- ID and goal:
- Owner role:
- Reviewer roles:
- Status:
- Scope / exclusions:
- Acceptance criteria:
- Dependencies / approvals:
- Assumptions and risks:
- Changed artefacts:
- Verification evidence and gaps:
- Next action / handoff:

## 5. Alignment with the supplied governance

The source attachments remain unchanged:
- uploads/AGENT-PROFILE.md
- uploads/_template.md

The owner's explicit team instruction supersedes the source profile's "working alone" description. A later revision should make that wording consistent with the agreed charter.

The source profile also points to docs/profiles/the-box-house.md. That client profile was not supplied. Do not assume it is the current client. Keep the core profile generic and select a client profile explicitly when the project is known.

This proposal strengthens coordination and review. It does not remove the source profile's engineering, cost, security, brand, or verification requirements.

## 6. Project-specific QMS coordinator

The owner requires a QMS coordinator for the spreadsheet-transformation project. This required function supplements the proposed generic roster.

It coordinates the applicable rule checklist, mapping traceability, validation evidence, unresolved questions, and release/hold disposition. It does not replace implementation tests or make an AI confidence score sufficient for approval.

The owner selected automated QMS coordination: passing results can be released under agreed checks, while ambiguities or failures are held for clarification. Exact release criteria and exception handling still need definition. See BRIEF.md for the recorded answers and remaining questions.

## 7. Earlier discovery position (historical; superseded by sections 8–9)

The broad product goal is now confirmed: populate a destination spreadsheet from messy sources using AI-assisted, potentially row-to-column transformation, rules, and QMS review.

We are in requirements discovery, not product implementation. The generic roster and expanded workflow remain proposed. Templates vary by job/client, rules are embedded in the workbooks, and QMS coordination is automated. A new platform and strict containment are also confirmed. Inference must run inside the agreed private boundary. Sample files, rule details, available compute, actual hosting, and exact release criteria are still needed; share only synthetic or approved non-sensitive examples in this conversation.

## 8. Current delivery specification (supersedes earlier privacy notes)

The latest owner answers permit external AI processing and choose a local computer application. The earlier strict-containment choice is superseded by D-015. Rules conflicts must ask for clarification; reusable structural knowledge auto-saves only after QMS passes. See the current BRIEF.md and STATUS.md rather than treating earlier discovery notes as current requirements.

Project specialist responsibilities now include spreadsheet structure/rule analysis, AI mapping interpretation, a rules/knowledge steward, deterministic transformation, QA, and automated QMS coordination. These are work responsibilities and code stages, not claims of independent agents executing unobserved reviews.


## 9. Executed prototype work and open acceptance

The implementation, rule-analysis, cost/security, frontend, QA and documentation responsibilities have produced a synthetic working prototype and recorded executed checks in STATUS.md. Review was role-based; there is no claim of separate independent agents. Automated QMS is an implemented code stage, not an assertion of unknown business truth. Actual-data, live-provider and real-owner-device acceptance remain open; the original Definition of Done is not waived.
