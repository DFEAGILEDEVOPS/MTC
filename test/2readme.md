# MTC Playwright Test Suite

This document explains the Playwright-based tests in `test/pupil-hpa`, including prerequisites, setup, and run commands.

## What is covered

- End-to-end journey across admin and pupil apps
- Accessibility checks for admin and pupil accessibility statement pages
- API checks for auth and question endpoints

## Test locations

- Test package: `test/pupil-hpa`
- Playwright config: `test/pupil-hpa/playwright.config.ts`
- E2E test: `test/pupil-hpa/mtc-signin-and-check.playwright.spec.ts`
- Accessibility test: `test/pupil-hpa/accessibility.playwright.spec.ts`
- API tests: `test/pupil-hpa/api-request-context.playwright.spec.ts`, `test/pupil-hpa/api-request-context.remote.playwright.spec.ts`, `test/pupil-hpa/get-ping-guideline.playwright.spec.ts`

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

If these are not set, the E2E test falls back to `teacher1` and `password` for environments where interactive login is expected.

### Accessibility test target URLs

- `PUPIL_BASE_URL` (default: test pupil URL)
- `ADMIN_BASE_URL` (default: test admin URL)

### API test target URL

- `PUPIL_API_BASE_URL`
- `BASE_URL` (used by local API test file as fallback)

## How projects and skipping work

The Playwright config defines 6 projects:

- `dev-admin`, `dev-pupil`
- `test-admin`, `test-pupil`
- `preprod-admin`, `preprod-pupil`

The E2E test intentionally runs only on admin projects and skips `*-pupil` projects. This is expected because pupil credentials are generated in admin first, then the same E2E test navigates into the pupil app and completes the check flow.

## Run commands

From `test/pupil-hpa`:

### Run all Playwright tests in this package

```bash
npm test
```

### Run E2E flow only

```bash
npm run test:e2e
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

Run one project:

```bash
npx playwright test mtc-signin-and-check.playwright.spec.ts --project=dev-admin
```

Run headed mode for debugging:

```bash
npx playwright test mtc-signin-and-check.playwright.spec.ts --project=dev-admin --headed
```

## Reports and artifacts

- HTML report command:

```bash
npx playwright show-report
```

- Output directory: `test/pupil-hpa/test-results`
- On failure, Playwright keeps screenshot/video and trace for retries (per config)

## Common troubleshooting

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