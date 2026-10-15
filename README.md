# Kiaat v0.2 — customer workspace + QMS chat

**New modern tech workspace, not an already-published production service.** Open the `Kiaat online workspace` live preview to explore the working synthetic app. Real keys/live AI are disabled there.

## Talk to QMS

1. Choose **Explore operator demo**.
2. Select **Missing value · QMS hold** and click **Load example**.
3. Click **Run transformation**. QMS explains the missing North/February value in the right-hand chat; final export is locked.
4. Type **North Feb is 18** and send.
5. QMS shows an explicit proposal. Click **Confirm correction & rerun**.
6. It creates an audit-linked operator-input source without changing the originals, runs actual checks, then releases a passing workbook. Invalid values still hold.

Chat answers do not waive rules. Guided chat supports specific corrections, explanations, check commands and conflict choices. Broad language interpretation needs a configured external provider; it is not falsely simulated by canned text.

## Customer vs platform admin

- Customers see only their own jobs, conversations and knowledge. Allowed non-secret preferences are Theme, Density and explanation/check preferences.
- **Platform admin** owns shared AI keys/models, budgets, customer provisioning and global quotas.
- Use **Open platform admin demo** to see amounts created in the dashboard. Only the admin API can modify them. Users never receive shared key values.
- Preview role switching is explicitly synthetic; production requires password login. Credentials are hashed; server-side shared keys use encryption with a stable cloud secret. Sessions and CSRF are checked server-side.

## Run development preview

```sh
python -m pip install -r requirements.txt
SHEETQMS_DEMO=1 python -m uvicorn sheetqms.online:app --host 0.0.0.0 --port 3001 --no-access-log
```

On Windows, set `SHEETQMS_DEMO=1` using your shell before the command. Normal development uses private SQLite/local blobs; production rejects that fallback.

## Actual serverless deployment

See `docs/ARCHITECTURE.md` and `docs/DEPLOY.md`. The package has PostgreSQL/private-R2 adapters and a Cloud Run image recipe (min instances 0, stateless scratch processing). **No owner cloud account has been configured and no production URL deployed.** The development preview is not serverless production. Hosted DB/R2, cold starts, real phone/data, live AI and security/retention acceptance remain open.

Initial AI/platform budgets are USD 0 and AI paused. The owner requested amounts created in admin rather than supplying a purchase budget. An admin planning ceiling cannot guarantee a hosting-provider invoice cap; configure provider account controls separately. No paid call was made.

## Scope

Only spreadsheet transformation: inspect, direct/pivot/matrix/unpivot/A-label B-value form mapping, embedded rules, clarification, deterministic QMS, source provenance, gated XLSX export and post-pass scoped knowledge. Original v0.1 core feature/Excel/formula/precision limits still apply. Unknown instructions/features hold. No arbitrary code/macros or blanket “perfect accuracy” claim.

Invite-only provisioning is implemented; self-signup, email/reset delivery and independent security audit are not. Private job-history deletion removes blobs/job/conversation; minimal append-only audit and passing structural knowledge are retained, so this is not a blanket data-erasure compliance claim.

## Verification

Executed development tests: `verification/automated-tests.txt`. Browser workflow/accessibility proof: `verification/browser-checks.json`, with desktop/mobile screenshots. These are synthetic, local/development adapter results, not proof of hosted PostgreSQL/R2 or real-customer accuracy.

```sh
python -m pytest -q
npm install
npm run build
python -m playwright install --with-deps chromium
python browser_checks.py
```

The included JS is compiled from strict TypeScript; Node is development-only. Static assets are embedded/same-origin and content-hash cache-busted. The older local prototype/source ZIP remains separate for rollback and its historical evidence is not relabelled as v0.2 proof.
