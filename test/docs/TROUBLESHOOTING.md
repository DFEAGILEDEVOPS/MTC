# MTC Playwright Troubleshooting

Use this guide for common Playwright E2E failures in `test/pupil-hpa`, likely causes, and fix steps.

For setup and run commands, see `test/docs/PlaywrightTestREADME.md`.

## Quick triage

1. Identify failing project/job (`*-setup`, `*-admin`, `*-check`, `preprod-admin`).
2. Check whether failure is environment/state/auth related before changing test code.
3. Re-run a targeted command in headed mode where relevant.
4. Use artifacts (`test-results`, Playwright report, traces/screenshots) to confirm root cause.

## Preprod runbook: auth refresh and scheduled-day validation

Use this whenever preprod admin tests redirect to sign-in or fail due to expired session state.

1. Generate a fresh auth file locally from repo root:

```bash
npm run save:auth
```

2. Complete preprod sign-in in the launched browser and press ENTER in terminal.
3. Verify root `auth.json` was updated and is valid JSON.
4. Base64-encode the updated root `auth.json`:

```bash
base64 -i auth.json | tr -d '\n'
```

5. In Azure DevOps, open the variable where `AUTH_JSON_CONTENT` is defined.
6. Replace `AUTH_JSON_CONTENT` with the new value and save.
7. Manually queue the Playwright pipeline (manual run is non-scheduled, so Preprod job is included).
8. Verify `Playwright - Preprod` completes and publishes artifacts/results.

Notes:

- The restore step accepts base64 or raw JSON, but base64 is recommended for secret storage safety.
- `AUTH_JSON_CONTENT` is consumed by all Playwright jobs, so refreshing it updates the stored session for pipeline runs.

## Preprod-specific failure mode: pupil exhaustion

Unlike dev/test, preprod cannot run the setup flow to add new pupils for each run because:

- Dev/test setup uses sequential username/password role switches.
- Preprod uses DfE Sign-in (OAuth) with a single pre-authenticated `auth.json` storage state.

Symptoms:

- Official check or try-it-out flow fails with "No pupils found".

Resolution:

- Verify test pupils still exist in preprod admin.
- Manually add/replenish test pupils when numbers are low.
- Re-run the failed preprod job after pupil data is restored.

## Common failures and fixes

### Setup fails with "Add pupil is disabled"

- Cause: check-window phase or HDF state makes add-pupil unavailable for teacher role.
- Fix: run against an environment with add-pupil availability, or use a role/state that permits adding pupils.

### Setup fails due to login prompt loops

- Confirm credentials are valid:
	- `test-developer/password`
	- Teacher credentials (`ADMIN_USERNAME`/`ADMIN_PASSWORD`, or fallback `teacher2/password`)
- Run setup alone in headed mode to inspect redirects.

### E2E fails selecting a pupil checkbox

- Cause is usually environment data timing or session interruptions in admin.
- Retry against a single project in headed mode for diagnosis.

### Preprod admin redirects back to sign-in

- Refresh auth state with `npm run save:auth`.
- Confirm `auth.json` exists at repo root.
- If running in pipeline, refresh `AUTH_JSON_CONTENT` using the runbook above.

### Accessibility or API checks run against wrong environment

- Set `PUPIL_BASE_URL`, `ADMIN_BASE_URL`, and `PUPIL_API_BASE_URL` explicitly before running.

### Browser binaries missing

- Re-run:

```bash
npx playwright install --with-deps
```

### PublishTestResults shows no XML files

- Ensure CI run includes JUnit reporter via `PW_E2E_ARGS='--reporter=blob,junit,line'`.
- Confirm output path matches Azure task pattern: `test/pupil-hpa/test-results/*.xml`.

### Pipeline fails only in Preprod with auth redirects

- Refresh `auth.json` and `AUTH_JSON_CONTENT` using the preprod runbook above.
- Confirm decoded secret restores valid JSON at repo root during pipeline run.

### Production release blocked by gate

- Verify latest Playwright pipeline run succeeded for expected branch.
- Verify gate endpoint/pipeline ID in release configuration.
- If manual approval is configured, ensure an approver has approved.

## Environment reset and sign-hdf readiness

Each Azure deployment can reset shared test environments. After deployment, schools may return to a state where `0` pupils have completed checks.

Impact:

- `test/pupil-hpa/sign-hdf.playwright.spec.ts` can fail because declaration is unavailable.

Checks and fix:

- For dev/test sign-hdf flow, use reserved account `teacher5/password`.
- Confirm Example School Five (`2011005`) is left in a state where all pupils have completed checks.
- Re-prepare school state after deployment before rerunning `sign-hdf`.

## Pipeline outcome interpretation

- Failed in setup jobs: investigate test-data/environment readiness first.
- Failed in main specs: inspect Playwright traces/screenshots and assertions.
- Failed publish step with passing tests: treat as reporting pipeline defect (JUnit path/reporter).
- Preprod-only failures: validate `auth.json` freshness and available pupil data before code-level debugging.
