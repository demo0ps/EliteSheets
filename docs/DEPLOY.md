# Publish the serverless app — owner setup required

**Not yet executed.** There are no connected owner cloud accounts or production credentials supplied. This is an executable deployment package, not proof of a live deployment. Do not paste secrets into Arena chat.

## 1. Provision private durable services

Create owner-controlled PostgreSQL with TLS (pooled endpoint preferred) and a private R2 bucket. Leave public bucket URLs disabled. Create bucket-scoped least-privilege credentials. Choose a data region/jurisdiction and retention policy appropriate to customer data; neither has been confirmed here.

Generate a stable encryption key privately. Put the database URL, encryption key, R2 credentials and first-admin bootstrap credentials in the cloud secret manager. Use a 12+ character initial admin password and rotate/remove bootstrap credentials after provisioning. A missing encryption key or durable production database must block startup, not fall back to local storage.

## 2. Apply schema before cold instances

With the secret environment configured in a controlled terminal:

```sh
python -m pip install -r requirements.txt
python -m sheetqms.migrate
```

This step is not run in this workspace against a live account. Use a database role with schema permissions only for migration; a least-privilege runtime role thereafter.

## 3. Build and deploy to Cloud Run

Build `deploy/Dockerfile` from the repository root and push to your private artifact registry. Source static JS/CSS is included; Node is not needed inside the runtime image.

Use request-based billing, **min instances 0**, **concurrency 1**, an initial **max instances 2**, **1GiB memory**, **1 vCPU**, **300s timeout**. These are configurable initial safeguards, not a capacity benchmark. Provider-account billing must be enabled only with owner approval; a free tier does not prevent all charges (builds/artifacts/egress/storage can bill).

Bind the secrets through Secret Manager. Set `SHEETQMS_ENV=production`, `SHEETQMS_DEMO=0`, `SHEETQMS_AUTO_MIGRATE=0`, `SHEETQMS_APP_HOSTS` to the exact published host/custom domain. Use the platform-issued HTTPS URL first; do not deploy with wildcard allowlists beyond an approved domain scope. The service accepts public unauthenticated traffic only at the hosting layer so its **own login** can authenticate customers; job/admin routes enforce app sessions and isolation. Add perimeter rate limiting as part of the production security review.

No deploy command with an invented project ID is provided. The correct service account/project/domain must come from the owner's actual cloud setup. `gcloud run deploy` can use these flags once the owner supplies valid project/image/service names.

## 4. Bootstrap and configure admin

Log in with the privately provisioned initial admin account. Create customer/operator accounts in Admin dashboard and distribute initial passwords out of band. Public self-signup, email verification/password-reset delivery and customer self-service team administration are not implemented yet.

Budget amounts start at 0. Set a positive platform planning ceiling and an AI allowance no larger than it; verify official model prices/terms within 30 days; save the provider key in the write-only admin field. It is encrypted at rest and never returned. Enable the kill switch only after account-wide provider caps are set. Each analysis still needs job-specific external-processing consent.

## 5. Verify the actual hosted URL before production

Run the full suites and browser workflows on the published HTTPS host. Test operator/admin roles, cross-customer ID access, CSRF, re-login/refresh, private blob handling, input/output hash gates, deletion, job lease recovery, duplicate requests, quota races, provider failure and budget boundaries. Run real-phone/customer checks and real-data/golden-result acceptance. Validate PostgreSQL triggers/leases and R2 integration against live services, not only development SQLite or mocks.

Back up durable data using provider-supported mechanisms. Export schemas/rules/audits safely; never put raw keys in backups or logs. Test restore and tenant deletion against the agreed retention policy. Until those checks run, status remains **development-verified / production acceptance open**.
