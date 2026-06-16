# MTC Playwright Test Suite

This document explains the Playwright-based tests in `test/pupil-hpa`, including prerequisites, setup, and run commands.

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
- API tests: `test/pupil-hpa/api-request-context.remote.playwright.spec.ts`, `test/pupil-hpa/get-ping-guideline.playwright.spec.ts`

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

This launches a browser, asks you to complete login manually, then saves session data to `auth.json`.

## Environment variables

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

The Playwright config defines 10 projects:

| Project | Setup dependency | Specs included |
|---|---|---|
| `dev-setup` | — | `ensure-pupil.setup.playwright.ts` only |
| `dev-check` | `dev-setup` | `mtc-signin-and-check`, `mtc-signin-and-try-it-out`, `mtc-accessibility-check` |
| `dev-admin` | none | all other `*.playwright.spec.ts` |
| `dev-pupil` | none | all `*.playwright.spec.ts` |
| `test-setup` | — | `ensure-pupil.setup.playwright.ts` only |
| `test-check` | `test-setup` | `mtc-signin-and-check`, `mtc-signin-and-try-it-out`, `mtc-accessibility-check` |
| `test-admin` | none | all other `*.playwright.spec.ts` |
| `test-pupil` | none | all `*.playwright.spec.ts` |
| `preprod-admin` | none | all `*.playwright.spec.ts` (uses `auth.json`) |
| `preprod-pupil` | none | all `*.playwright.spec.ts` |

### Why the setup is scoped to -check projects only

The three specs in the `-check` projects (`mtc-signin-and-check`, `mtc-signin-and-try-it-out`, `mtc-accessibility-check`) all generate a pupil PIN in admin and have a pupil complete a flow. They require at least one pupil to exist in the school before they can run.

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

The three pupil-flow specs skip themselves unless the running project name ends in `-admin` or `-check`. This means:
- Running via `*-check` → test runs (setup has already fired as a dependency)
- Running via `*-admin` → test also runs (for ad-hoc targeted runs), but without guaranteed setup
- Running via `*-pupil` or any other project → test skips

### Why preprod has no setup dependency

Preprod admin uses DfE Sign-in with `auth.json` storage state. The setup flow uses fixed username/password credentials (`test-developer` then teacher), so it is wired only for dev/test.

## Run commands

From `test/pupil-hpa`:

### Run all Playwright tests in this package

```bash
npm test
```

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
npm run test:api:remote:current
```

### Run ping and auth smoke checks

```bash
npm run test:api:ping
```

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

- HTML report command:

```bash
npx playwright show-report
```

- Output directory: `test/pupil-hpa/test-results`
- On failure, Playwright keeps screenshot/video and trace for retries (per config)
- Setup state file: `test/pupil-hpa/test-results/setup-state-dev.json` or `test/pupil-hpa/test-results/setup-state-test.json`

## Common troubleshooting

### Setup fails with "Add pupil is disabled"

- Cause: check-window phase or HDF state makes pupil add unavailable for teacher role
- Fix: run against an environment with add-pupil availability, or use a role/check-window state that permits adding pupils

### Setup fails due to login prompt loops

- Confirm credentials are valid:
	- test-developer/password
	- teacher credentials (`ADMIN_USERNAME`/`ADMIN_PASSWORD`, or fallback teacher1/password)
- Run setup alone in headed mode to inspect redirects

### E2E fails selecting a pupil checkbox

- Cause is usually environment data timing or session interruptions in admin
- Retry against a single project in headed mode for diagnosis

### Preprod admin redirects back to sign-in

- Refresh auth state with `npm run save:auth`
- Confirm `auth.json` exists at repo root

### Accessibility/API running against wrong environment

- Set `PUPIL_BASE_URL`, `ADMIN_BASE_URL`, and `PUPIL_API_BASE_URL` explicitly before running

### Browser binaries missing

- Re-run `npx playwright install --with-deps`