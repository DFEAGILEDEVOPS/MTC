# MTC Playwright Test Suite

This document explains the Playwright-based tests in `test/pupil-hpa`, including prerequisites, setup, and run commands.

For framework architecture, pipeline flow, and onboarding context, see `test/docs/DEVELOPER_GUIDE.md`.

## What is covered

- End-to-end journey across admin and pupil apps (official check, try-it-out check, and accessibility colour-contrast routing)
- Accessibility checks for admin and pupil accessibility statement pages
- API checks for auth and ping endpoints
- Setup flow that creates a new pupil before dev/test pupil-flow runs

## Test locations

- Test package: `test/pupil-hpa`
- Playwright config: `test/pupil-hpa/playwright.config.ts`
- Setup test: `test/pupil-hpa/ensure-pupil.setup.playwright.ts`
- Pupil-flow tests (require setup):
  - `test/pupil-hpa/mtc-signin-and-check.playwright.spec.ts`
  - `test/pupil-hpa/mtc-signin-and-try-it-out.playwright.spec.ts`
  - `test/pupil-hpa/mtc-accessibility-check.playwright.spec.ts`
- Admin-only tests (no setup required):
  - `test/pupil-hpa/sign-hdf.playwright.spec.ts`
  - `test/pupil-hpa/view-pupil-results.playwright.spec.ts`
- Accessibility statement test: `test/pupil-hpa/accessibility.playwright.spec.ts`
- API tests: `test/pupil-hpa/api-request-context.remote.playwright.spec.ts`

## Prerequisites

- Node.js 20+ recommended
- npm available
- Access to target environments (dev, test, preprod)
- For preprod admin runs: valid authenticated session captured into `auth.json`

## One-time setup

From repo root:

```bash
cd test/pupil-hpa
npm ci
npx playwright install --with-deps
```

Notes:

- `npm ci` installs dependencies in `test/pupil-hpa/package.json`
- `npx playwright install --with-deps` installs required browser binaries

## Preprod authentication setup

Preprod admin uses Playwright storage state from `auth.json`.

Generate or refresh it from repo root:

```bash
npm run save:auth
```

This launches a browser, asks you to complete login (PP teacher login) manually, then saves session data to `auth.json`.

## Azure pipeline (Playwright E2E)

Pipeline file: `azure-pipelines.yml`

Current Playwright jobs:

- `Playwright - Dev` runs `npm run test:e2e:dev`
- `Playwright - Test` runs `npm run test:e2e:test`
- `Playwright - Preprod` runs `npm run test:e2e:preprod`

Each job:

- uses `UseNode@1` with Node `20.x`
- restores root-level `auth.json` from Azure secret variable `AUTH_JSON_CONTENT`
- runs Playwright with blob + JUnit + line reporters in CI (`PW_E2E_ARGS='--reporter=blob,junit,line'`)
- writes JUnit XML into `test/pupil-hpa/test-results`
- publishes JUnit results (`PublishTestResults@2`) and uploads `test-results` plus `playwright-report` artifacts

### Why this matters

Historically, pipeline logs could show "No test result files matching ... *.xml" when only blob reporter output existed.
The CI run now explicitly emits JUnit XML, so Azure test result publishing can ingest Playwright runs.

### Supporting Azure runbooks

Use these companion documents for Azure-specific operation steps:

- `AZURE_PIPELINE_VERIFICATION_CHECKLIST.md` (pipeline wiring verification, validation and common publish issues)
- `test/docs/TEAMS_INTEGRATION.md` (optional Teams notifications for test results)

### Scheduled run policy (why preprod is excluded)

The Playwright pipeline is intentionally configured so weekday scheduled runs execute only Dev and Test, while Preprod runs on all non-scheduled runs (for example manual runs and CI runs).

This is done to reduce avoidable Preprod failures caused by expiring DfE Sign-in OAuth/session state in `auth.json` (often refreshed daily or near-daily in practice). Running Preprod only when needed keeps scheduled signal stable while still validating Preprod on non-scheduled executions.

### If you need Preprod on a scheduled day

See the troubleshooting runbook in `test/docs/TROUBLESHOOTING.md` for step-by-step instructions to refresh auth and force a non-scheduled Preprod validation run.

### Scheduled run policy (why preprod is excluded)

The Playwright pipeline is intentionally configured so weekday scheduled runs execute only Dev and Test, while Preprod runs on all non-scheduled runs (for example manual runs and CI runs).

This is done to reduce avoidable Preprod failures caused by expiring DfE Sign-in OAuth/session state in `auth.json` (often refreshed daily or near-daily in practice). Running Preprod only when needed keeps scheduled signal stable while still validating Preprod on non-scheduled executions.

### If you need Preprod on a scheduled day

Use this runbook when you want a scheduled-day Preprod check without changing pipeline policy:

1. Refresh auth locally from repo root:

```bash
npm run save:auth
```

2. Base64-encode the updated root `auth.json`:

```bash
base64 -i auth.json | tr -d '\n'
```

3. Update Azure secret variable `AUTH_JSON_CONTENT` with the new value.
4. Manually queue the Playwright pipeline (manual run is non-scheduled, so Preprod job is included).
5. Verify `Playwright - Preprod` completes and publishes artifacts/results.

If true scheduled Preprod is temporarily required, create a short-lived YAML change to relax the Preprod schedule condition, run/validate, then revert to this default policy.

## Environments, dependencies and access policy

| Environment | Pipeline job | Core dependencies | Access policy |
|---|---|---|---|
| Dev | `Playwright - Dev` | Azure DevOps pipeline run permission, Node 20, npm install, Playwright browsers, reachable dev admin/pupil/auth URLs | Dev/test credentials (`ADMIN_USERNAME`/`ADMIN_PASSWORD`) or fallback creds for test automation accounts |
| Test | `Playwright - Test` | Same as Dev, plus stable test data availability for setup + pupil flows | Dev/test credentials (`ADMIN_USERNAME`/`ADMIN_PASSWORD`) or fallback creds for test automation accounts |
| Preprod | `Playwright - Preprod` | Same base dependencies plus valid root `auth.json` restored from Azure secret `AUTH_JSON_CONTENT` | DfE Sign-in session in `auth.json`; access to update secret variable in Azure DevOps when session expires |

### Environment dependency notes

- All pipeline jobs depend on `azure-pipelines.yml`, `test/pupil-hpa/package.json` scripts, and `test/pupil-hpa/playwright.config.ts` project definitions.
- Dev/Test check projects depend on setup projects to create/select usable pupil data before running check flows.
- Preprod cannot run the setup flow because it relies on a single authenticated storage state (`auth.json`) rather than sequential username/password role switches.

### Access controls and handling policy

- `AUTH_JSON_CONTENT`, `TEAMS_WEBHOOK_URL`, and any credentials must be stored as Azure secret variables (never committed).
- Pipeline run permissions should be limited to the engineering/QA group responsible for e2e validation.
- Production release permissions should remain approval-gated (see production gate setup doc) and require named approvers.
- Use least-privilege test accounts for automation; rotate credentials and refresh `auth.json` when sign-in behavior changes.

## Deployment, rollback, versioning and change control

### Deployment process (pipeline + release)

1. Raise a branch and PR with test or pipeline changes.
2. Run Playwright pipeline on the feature branch and confirm Dev/Test/Preprod jobs publish results.
3. Merge only after successful validation and review.
4. Trigger release pipeline with production gate checks enabled.

### Rollback mechanism

- Pipeline definition rollback: revert `azure-pipelines.yml` to the last known-good commit and re-run pipeline.
- Test framework rollback: revert Playwright test/config/script changes in `test/pupil-hpa` to last known-good commit.
- Release rollback: do not approve production stage until gate is green; if a bad change was merged, deploy previous known-good build artifact while corrective PR is prepared.

### Versioning and release process

- Version source of truth is git history on `master` (or active release branch policy).
- Treat any changes to pipeline YAML, Playwright config, or e2e scripts as release-impacting and include them in release notes.
- Keep runbook docs updated in the same PR as code/config changes to preserve traceability.

### Change controls

- Mandatory PR review for `azure-pipelines.yml` and `test/pupil-hpa/*` pipeline-impacting files.
- Record pipeline run link and test evidence in PR before approval.
- Use `test/docs/AZURE_PIPELINE_VERIFICATION_CHECKLIST.md` as the minimum quality gate before merge.

## Testing plan, reports and dashboards

### Standard testing plan

1. Smoke check targeted spec locally (headed if needed).
2. Run environment-specific e2e (`test:e2e:dev`, `test:e2e:test`, `test:e2e:preprod`) as required by the change scope.
3. Run Azure pipeline jobs for Dev/Test/Preprod.
4. Review failures, fix, and re-run affected scope.
5. Capture evidence in PR and release notes.

### Reports and dashboards

- Local/CI JUnit XML files in `test/pupil-hpa/test-results/*.xml`.
- Azure DevOps **Tests** tab for pass/fail trend and per-test history.
- Azure DevOps **Artifacts** tab for `test-results` and HTML report output.
- Optional Microsoft Teams dashboard-style notifications via webhook reporter.

## Troubleshooting and operational runbooks

For common failures, root-cause hints, and step-by-step fixes, use `test/docs/TROUBLESHOOTING.md`.

## Environment variables

### Reserved sign-hdf teacher account (dev/test)

For `test/pupil-hpa/sign-hdf.playwright.spec.ts`, `teacher5` / `password` is reserved for both dev and test runs.

It maps to Example School Five (`2011005`), so that school must be left in a state where all pupils have completed checks. Otherwise the headteacher declaration form can show as unavailable and the sign-hdf flow will fail.

### E2E admin login (dev/test fallback creds)

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

If these are not set, the tests fall back to `teacher2` and `password` for environments where interactive login is expected. The setup spec also uses these same env vars (same fallback), so both the setup and the e2e tests operate against the same school.

### Accessibility test target URLs

- `PUPIL_BASE_URL` (default: test pupil URL)
- `ADMIN_BASE_URL` (default: test admin URL)

### API test target URL

- `PUPIL_API_BASE_URL`

## How projects and skipping work

The Playwright config currently defines 13 projects:

| Project | Setup dependency | Specs included |
|---|---|---|
| `dev-preflight` | — | `ensure-environment-preflight.setup.playwright.ts` |
| `dev-setup` | `dev-preflight` | `ensure-pupil.setup.playwright.ts` |
| `dev-accessibility-setup` | `dev-preflight` | `ensure-accessibility-pupil.setup.playwright.ts` |
| `dev-admin` | `dev-preflight` | admin-focused specs (excludes check-flow + accessibility check specs) |
| `dev-check` | `dev-setup` | `mtc-signin-and-check`, `mtc-signin-and-try-it-out` |
| `dev-accessibility` | `dev-accessibility-setup` | `mtc-accessibility-check` |
| `test-preflight` | — | `ensure-environment-preflight.setup.playwright.ts` |
| `test-setup` | `test-preflight` | `ensure-pupil.setup.playwright.ts` |
| `test-accessibility-setup` | `test-preflight` | `ensure-accessibility-pupil.setup.playwright.ts` |
| `test-admin` | `test-preflight` | admin-focused specs (excludes check-flow + accessibility check specs) |
| `test-check` | `test-setup` | `mtc-signin-and-check`, `mtc-signin-and-try-it-out` |
| `test-accessibility` | `test-accessibility-setup` | `mtc-accessibility-check` |
| `preprod-check` | none | `mtc-signin-and-check`, `mtc-signin-and-try-it-out` using `auth.json` storage state |

### Why preflight and setup exist

These tests protect shared state and test data before the main E2E flows run:

- Preflight (`ensure-environment-preflight.setup.playwright.ts`) normalises the check-window state in admin so dependent flows start from a known, open-window configuration. It logs in as service-manager, updates Development Phase date fields to a valid open range around the current date, saves (including override handling), and signs out.
- Setup (`ensure-pupil.setup.playwright.ts` and `ensure-accessibility-pupil.setup.playwright.ts`) prepares environment-specific pupil data needed by downstream specs. This ensures check and accessibility journeys have a usable pupil context and do not fail due to missing or stale data.

### Why the setup is scoped to -check projects only

The check-flow specs (`mtc-signin-and-check`, `mtc-signin-and-try-it-out`) generate a pupil PIN in admin and have a pupil complete a flow. They require at least one pupil to exist in the school before they can run.

The accessibility flow (`mtc-accessibility-check`) has its own dedicated setup dependency (`*-accessibility-setup` -> `*-accessibility`).

The other admin specs (`sign-hdf`, `view-pupil-results`) do not drive a pupil through the app and therefore do not need the setup overhead. Running them via `dev-admin` or `test-admin` skips the setup entirely.

### What the setup project does

1. Signs in to admin as `test-developer` / `password`
2. Opens `/test-developer/home`
3. Generates a valid, unique UPN in test code (using current timestamp seed + UPN check-letter algorithm)
4. Signs out
5. Signs in as teacher (`ADMIN_USERNAME`/`ADMIN_PASSWORD` or fallback `teacher2`/`password`)
6. Opens `/pupil-register/pupils-list` and verifies the Add pupil action is enabled
7. Creates a new pupil at `/pupil-register/pupil/add` using the generated UPN (first name `PW`, last name `SetupPupil`)
8. Verifies success and writes setup state to `test/pupil-hpa/test-results/setup-state-<env>.json`

This guarantees there is always at least one fresh pupil available before the pupil-flow specs run. The setup and the e2e specs both default to `teacher2` so that the created pupil and the PIN generation happen within the same school.

### Skip guards

The pupil-flow PIN-generation specs (`mtc-signin-and-check` and `mtc-signin-and-try-it-out`) skip themselves unless the running project name ends in `-check`. This means:
- Running via `*-check` → test runs (setup has already fired as a dependency)
- Running via `*-admin` → test skips, keeping admin-only runs independent of pupil setup
- Running via other project types (for example `*-accessibility`) → test skips

### Why preprod has no setup dependency

Preprod admin uses DfE Sign-in with `auth.json` storage state. The setup flow uses fixed username/password credentials (`test-developer` then teacher), so it is wired only for dev/test.

For known preprod failure modes (including pupil exhaustion and auth expiry), see `test/docs/TROUBLESHOOTING.md`.

## Run commands

From `test/pupil-hpa`:

### Local vs pipeline commands (important)

`npm test` is intentionally local-optimised and is not the same command path used by Azure pipeline jobs.

- Local `npm test` runs three separate invocations to reduce cross-suite flakiness:
  - `npm run test:core`
  - `npm run test:accessibility:dev`
  - `npm run test:accessibility:test`
- Pipeline jobs in `azure-pipelines.yml` run `test:e2e:*` scripts (`test:e2e:dev`, `test:e2e:test`, `test:e2e:preprod`) because those scripts manage blob/JUnit output and report merge/publish steps used by Azure DevOps.

Use `npm test` for day-to-day local confidence. Use `npm run test:e2e:dev` / `npm run test:e2e:test` / `npm run test:e2e:preprod` when you want behaviour closer to pipeline execution.

### Run all Playwright tests in this package

```bash
npm test
```

This local command runs `test:core`, then `test:accessibility:dev`, then `test:accessibility:test` in separate Playwright processes.

### Run core suite only (no accessibility projects)

```bash
npm run test:core
```

### Run isolated accessibility suites

```bash
npm run test:accessibility:dev
npm run test:accessibility:test
```

### Run test e2e sequence with one merged HTML report

```bash
npm run test:e2e:test
```

This runs a 2-step test sequence (accessibility -> main shard). The accessibility step runs `test-accessibility`, which triggers `test-accessibility-setup` exactly once via project dependency. The main shard includes `test-check`, so Playwright runs its `test-setup` dependency automatically before the check-flow specs. Each step writes to a separate blob report file, then the reports are merged into one combined HTML report.

### Run pupil-flow tests (with setup)

```bash
npx playwright test --project=test-check
npx playwright test --project=dev-check
```

Playwright automatically runs the corresponding setup project first, then runs the three pupil-flow specs.

### Run admin-only tests (no setup)

```bash
npx playwright test --project=test-admin
npx playwright test --project=dev-admin
```

This runs `sign-hdf`, `view-pupil-results`, and any other admin specs without triggering pupil creation.

### Run a single spec with setup

```bash
npx playwright test mtc-signin-and-check.playwright.spec.ts --project=test-check
npx playwright test mtc-signin-and-try-it-out.playwright.spec.ts --project=test-check
npx playwright test mtc-accessibility-check.playwright.spec.ts --project=test-check
```

### Run setup only (debug)

```bash
npx playwright test ensure-pupil.setup.playwright.ts --project=dev-setup --headed
npx playwright test ensure-pupil.setup.playwright.ts --project=test-setup --headed
```

### Run accessibility checks

```bash
npm run test:accessibility
```

### Run API checks (default/local)

```bash
npm run test:api
```

### Run API checks against remote auth service

```bash
npm run test:api:remote
```

### Run ping and auth smoke checks

```bash
npm run test:api:ping
```

This runs a `--grep` subset of `api-request-context.remote.playwright.spec.ts` for the `GET /ping` and `POST /auth` checks.

### Run combined remote set

```bash
npm run test:all:remote
```

## Useful targeted runs

Run the full check flow against test (setup fires automatically):

```bash
npx playwright test --project=test-check
```

Run a single spec in headed mode for debugging:

```bash
npx playwright test mtc-signin-and-check.playwright.spec.ts --project=test-check --headed
npx playwright test mtc-signin-and-try-it-out.playwright.spec.ts --project=test-check --headed
npx playwright test mtc-accessibility-check.playwright.spec.ts --project=test-check --headed
```

Run admin-only specs without setup:

```bash
npx playwright test sign-hdf.playwright.spec.ts --project=test-admin
npx playwright test view-pupil-results.playwright.spec.ts --project=test-admin
```

## Reports and artifacts

- Combined test-environment sequence + merged HTML report:

```bash
npm run test:e2e:test
```

- HTML report command:

```bash
npx playwright show-report
```

- Output directory: `test/pupil-hpa/test-results`
- On failure, Playwright keeps screenshot/video and trace for retries (per config)
- Setup state file: `test/pupil-hpa/test-results/setup-state-dev.json` or `test/pupil-hpa/test-results/setup-state-test.json`

## Common troubleshooting

See `test/docs/TROUBLESHOOTING.md` for failure symptoms, likely causes, and fix steps.

## Developer onboarding guide (trigger and interpret pipeline)

Use this quick-start for newly onboarded engineers.

### Trigger pipeline runs

1. Confirm local checks in `test/pupil-hpa` pass for your change scope.
2. Push branch and open PR.
3. In Azure DevOps, run the Playwright pipeline against your branch.
4. Confirm all environment jobs complete and results publish.

### Interpret pipeline outcomes

See `test/docs/TROUBLESHOOTING.md` for failure interpretation and triage paths.

### Escalation path

1. Retry once to rule out transient platform issues.
2. If reproducible, raise issue with failing job link, test name, and artifact evidence.
3. If release-impacting, block merge/deploy until gate criteria are met or explicit exception is approved.