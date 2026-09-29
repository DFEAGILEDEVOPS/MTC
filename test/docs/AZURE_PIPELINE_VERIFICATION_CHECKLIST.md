# Azure Pipeline Verification Checklist

Use this checklist to confirm the pipeline is correctly wired to the Playwright tests YAML and safe to deploy on a feature branch.

## Step 1: Verify Azure DevOps Pipeline Configuration

### Finding the Pipeline Settings (Without Edit Permission)

If you don't have edit permission or don't see an **Edit** button, you can still verify the pipeline configuration by checking what YAML file a recent run used:

**Method 1: Check a Recent Pipeline Run** (Always Available)
1. Navigate to **Azure DevOps** → **Pipelines** → Click the pipeline name
2. Click on any recent run (green checkmark or red X)
3. Top left: You'll see **Branch**: `master` or your selected feature branch
4. Click the **...** (three dots) menu → **Export to YAML**
5. This shows you exactly which `azure-pipelines.yml` was used

**Method 2: If You DO Have Edit Permission**
1. From the pipeline overview, look for an **Edit** button at the top (might be near top left, not always visible)
2. Or click the three dots → look for **Edit in designer** or similar (if using classic editor)
3. In the YAML editor, you should see the file path in the header

**Method 3: Ask Your Azure DevOps Admin**
1. If no Edit/Settings option appears, you may lack pipeline edit permissions
2. Request permission to edit pipelines, or ask an admin to verify the YAML path for you

### What to Verify

In the pipeline definition, confirm these details:

- [ ] **Repository**: Points to the MTC repository (GitHub or Azure Repos)
- [ ] **Default branch**: `master` (or intended default)
- [ ] **YAML file path**: `azure-pipelines.yml` (from repo root)
- [ ] **Verification**: Click on a recent run and check which branch/YAML it executed

**Quick check** (No edit permission needed):
Click any recent run → **...** menu → **View YAML** or **Export to YAML** to see the pipeline definition that was actually used.

---

## Step 2: Verify YAML Content Locally

Run this command to confirm the Playwright jobs are defined:

```bash
cd /Users/hannahmorgan/MTC
grep -n "^jobs:" azure-pipelines.yml
grep -n "displayName: 'Playwright" azure-pipelines.yml
```

Expected output:
```
15:jobs:
17:    displayName: 'Playwright - Dev'
80:    displayName: 'Playwright - Test'
143:    displayName: 'Playwright - Preprod'
```

- [ ] All three Playwright job entries are present in `azure-pipelines.yml`

---

## Step 3: Deploy Branch to Pipeline (Without Merging to Master)

### Option A: Manual Trigger on Feature Branch (Fastest for Testing)

1. Push your feature branch with Playwright tests:
   ```bash
   git push origin <your-feature-branch>
   ```

2. In Azure DevOps, go to **Pipelines** → select the test runner pipeline
3. Click **Run pipeline**
4. In the dialog:
   - Select **Branch**: `<your-feature-branch>`
   - Leave other defaults
   - Click **Run**

5. Monitor the run:
   - Pipeline should checkout your branch
   - Should execute jobs from `azure-pipelines.yml` on that branch
   - Job names: "Playwright - Dev", "Playwright - Test", "Playwright - Preprod"

### Option B: Create a Temporary Pull Request (Safer, Closer to Prod)

1. Push feature branch: `git push origin <your-feature-branch>`
2. Open a **Draft Pull Request** against `master` (do not merge yet)
3. Azure Pipelines will automatically trigger on the PR:
   - PR validation pipeline runs on the feature branch
   - Tests execute in isolation
   - No changes to `master` until you approve

---

## Step 4: Validate Test Execution in Pipeline

Once the pipeline run starts, verify these steps appear in the job timeline:

### For Each Job (Dev, Test, Preprod):

- [ ] **Install Node.js** step completes
- [ ] **Cache npm dependencies** step completes (may be cache hit/miss)
- [ ] **Install test dependencies** step runs `npm ci`
- [ ] **Install Playwright browsers** step runs `npx playwright install --with-deps`
- [ ] **Run Playwright tests** step executes and shows test output
- [ ] **Publish Playwright test results** collects JUnit XML from `test-results/`
- [ ] **Upload Playwright test results** publishes artifact

### Expected Behavior:

- Test results appear in Azure DevOps **Tests** tab (if JUnit publisher works)
- Artifacts appear under **Artifacts** tab with folder name like `MTC-Playwright-Test-Results-Dev`
- No Ruby/Cucumber/Gemfile references in logs

### Expected Test Scope By Environment:

- **Dev** should run: `mtc-signin-and-check`, `mtc-signin-and-try-it-out`, `mtc-accessibility-check`, `sign-hdf`, `view-pupil-results`, `ensure-accessibility-pupil.setup`, `ensure-pupil.setup`
- **Test** should run: `mtc-signin-and-check`, `mtc-signin-and-try-it-out`, `mtc-accessibility-check`, `sign-hdf`, `view-pupil-results`, `ensure-accessibility-pupil.setup`, `ensure-pupil.setup`
- **Preprod** should run: `mtc-signin-and-check`, `mtc-signin-and-try-it-out`
- **Preprod should NOT run**: `view-pupil-results`, `sign-hdf`

---

## Step 5: Troubleshoot If Pipeline Does Not Run Tests

### Issue: Pipeline runs but doesn't execute Playwright steps

**Check**:
1. Verify `azure-pipelines.yml` exists on the feature branch:
   ```bash
   git show <feature-branch>:azure-pipelines.yml | head -20
   ```

2. Manually trigger pipeline and watch logs for errors like:
   - `azure-pipelines.yml not found`
   - `yaml parsing error`

3. If error, fix YAML syntax:
   ```bash
   cd test/pupil-hpa && npm run test:e2e:dev -- --dry-run 2>&1 | head -50
   ```

### Issue: Pipeline runs old Ruby tests instead of Playwright

**Check**:
1. Verify Azure DevOps pipeline settings point to `/azure-pipelines.yml` (not a classic release)
2. Check if a **Classic Pipeline** also exists and runs automatically
   - If yes, disable or reconfigure the classic pipeline to avoid conflicts

### Issue: Test results don't publish

**Check**:
1. Confirm JUnit output files exist:
   ```bash
   cd test/pupil-hpa && npm run test:e2e:dev && ls -la test-results/*.xml
   ```

2. In pipeline step "PublishTestResults@2", verify:
   - `testResultsFiles` path matches your output location
   - Format is set to `JUnit` (not NUnit or other)

---

## Step 6: Document Findings

Once the pipeline runs successfully on your branch, record:

- [ ] **Branch name**: `<your-feature-branch>`
- [ ] **Pipeline name**: (from Azure DevOps URL)
- [ ] **YAML path**: `azure-pipelines.yml`
- [ ] **Run ID**: (link to successful run)
- [ ] **Test results**: Number of tests, pass/fail counts per job
- [ ] **Artifacts uploaded**: Confirm test-results folder is available

---

## Summary: Safe Pathway to Production

1. ✅ Deploy on feature branch → Verify Playwright tests run
2. ✅ Review test results and logs
3. ✅ Confirm no Ruby/legacy test runners are invoked
4. ✅ Merge feature branch to `master` (or target branch) when confident
5. ✅ Next `master` builds will automatically use Playwright pipeline

---

## Quick Reference: Key File Locations

| What | Path |
|------|------|
| Playwright Pipeline YAML | `/azure-pipelines.yml` |
| Test Projects Config | `/test/pupil-hpa/playwright.config.ts` |
| Test Scripts | `/test/pupil-hpa/package.json` (npm scripts) |
| Legacy Ruby Scripts (deprecated) | `/deploy/test-env/run-all-tests.sh` |

---

## Questions?

If pipeline behavior is unexpected, check:
1. Azure DevOps **Pipelines** → **Settings** for the pipeline
2. Repository settings (is YAML parsing enabled?)
3. Branch protection rules (do they trigger validation?)
4. Service connection permissions (can pipeline access repo?)
