# Microsoft Teams Integration for Playwright Tests

## Overview

The `teams-reporter.js` custom Playwright reporter sends test results to a Microsoft Teams channel via an Incoming Webhook. This enables real-time test status notifications in your Teams workspace.

---

## 🚀 Quick Start (Local Testing)

### 1. Create a Teams Incoming Webhook

1. Open Microsoft Teams and navigate to your desired channel
2. Click **⋯ (More options)** → **Connectors**
3. Search for **Incoming Webhook**
4. Click **Add** or **Configure**
5. Give it a name (e.g., `Playwright Test Results`)
6. Optionally upload an image for the webhook
7. Click **Create**
8. **Copy the webhook URL** (keep this secret — treat like a password)

### 2. Set the Environment Variable Locally

```bash
export TEAMS_WEBHOOK_URL="https://outlook.webhook.office.com/webhookb2/..."
```

### 3. Run Tests

```bash
npx playwright test

# Or with specific project:
npx playwright test --project=test-admin

# Notification-only-on-failure mode:
export TEAMS_NOTIFY_FAILURES_ONLY=true
npx playwright test
```

### 4. Verify in Teams

A message like this appears in your Teams channel:

```
✅ Playwright Tests PASSED
Environment: unknown
Status: passed
Total Tests: 45
Passed: 45
Duration: 120s
Projects: test-admin
```

---

## 🔧 Configuration Options

### Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `TEAMS_DISABLE_NOTIFICATIONS` | boolean | `false` | Suppress all Teams notifications for a run |
| `TEAMS_WEBHOOK_URL` | string | (required) | Teams Incoming Webhook URL |
| `TEAMS_NOTIFY_FAILURES_ONLY` | boolean | `false` | Only send notifications on test failures |
| `TEAMS_ENVIRONMENT` | string | `unknown` | Environment label (dev/test/preprod/prod) |

### Examples

```bash
# Only notify on failures
export TEAMS_NOTIFY_FAILURES_ONLY=true

# Label environment context
export TEAMS_ENVIRONMENT=staging

# Suppress notifications for one run
export TEAMS_DISABLE_NOTIFICATIONS=true

# Combine
export TEAMS_WEBHOOK_URL="..." TEAMS_ENVIRONMENT=staging TEAMS_NOTIFY_FAILURES_ONLY=true
```

---

## 🚀 Azure DevOps Pipeline Integration

### Step 1: Store the Webhook URL as a Secret Variable

1. Go to **Azure Pipelines → (Your Pipeline) → Edit**
2. Click **Variables** (top right)
3. Click **New Variable**
4. **Name:** `TEAMS_WEBHOOK_URL`
5. **Value:** Paste your Teams webhook URL
6. ✅ Check **Keep this value secret**
7. Click **OK** and **Save**

### Step 2: Update `azure-pipelines.yml`

Add the Teams webhook to your test job(s):

```yaml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

jobs:
  - job: TestAdmin
    displayName: 'Playwright - Admin Tests'
    steps:
      - task: NodeTool@0
        inputs:
          versionSpec: '20.x'
      
      - script: npm ci
        workingDirectory: test/pupil-hpa
        displayName: 'Install dependencies'
      
      - script: npx playwright install --with-deps
        workingDirectory: test/pupil-hpa
        displayName: 'Install Playwright browsers'
      
      - script: npx playwright test --project=test-admin
        workingDirectory: test/pupil-hpa
        displayName: 'Run admin tests'
        env:
          TEAMS_WEBHOOK_URL: $(TEAMS_WEBHOOK_URL)
          TEAMS_ENVIRONMENT: test
          TEAMS_NOTIFY_FAILURES_ONLY: 'false'

      # Example of suppressing notifications for a manual rerun or noisy branch
      - script: npx playwright test --project=test-admin
        workingDirectory: test/pupil-hpa
        displayName: 'Run admin tests without Teams notification'
        env:
          TEAMS_WEBHOOK_URL: $(TEAMS_WEBHOOK_URL)
          TEAMS_DISABLE_NOTIFICATIONS: 'true'
      
      - task: PublishTestResults@2
        condition: always()
        inputs:
          testResultsFormat: 'JUnit'
          testResultsFiles: 'test/pupil-hpa/test-results/**/*.xml'

  - job: TestCheck
    displayName: 'Playwright - Check Tests'
    steps:
      - task: NodeTool@0
        inputs:
          versionSpec: '20.x'
      
      - script: npm ci
        workingDirectory: test/pupil-hpa
        displayName: 'Install dependencies'
      
      - script: npx playwright install --with-deps
        workingDirectory: test/pupil-hpa
        displayName: 'Install Playwright browsers'
      
      - script: npx playwright test --project=test-check
        workingDirectory: test/pupil-hpa
        displayName: 'Run check tests'
        env:
          TEAMS_WEBHOOK_URL: $(TEAMS_WEBHOOK_URL)
          TEAMS_ENVIRONMENT: test
          TEAMS_NOTIFY_FAILURES_ONLY: 'false'
      
      - task: PublishTestResults@2
        condition: always()
        inputs:
          testResultsFormat: 'JUnit'
          testResultsFiles: 'test/pupil-hpa/test-results/**/*.xml'

  - job: TestAccessibility
    displayName: 'Playwright - Accessibility Tests'
    steps:
      - task: NodeTool@0
        inputs:
          versionSpec: '20.x'
      
      - script: npm ci
        workingDirectory: test/pupil-hpa
        displayName: 'Install dependencies'
      
      - script: npx playwright install --with-deps
        workingDirectory: test/pupil-hpa
        displayName: 'Install Playwright browsers'
      
      - script: npx playwright test --project=test-accessibility
        workingDirectory: test/pupil-hpa
        displayName: 'Run accessibility tests'
        env:
          TEAMS_WEBHOOK_URL: $(TEAMS_WEBHOOK_URL)
          TEAMS_ENVIRONMENT: test
          TEAMS_NOTIFY_FAILURES_ONLY: 'false'
      
      - task: PublishTestResults@2
        condition: always()
        inputs:
          testResultsFormat: 'JUnit'
          testResultsFiles: 'test/pupil-hpa/test-results/**/*.xml'
```

### Step 3: Multi-Environment Setup (Recommended)

For dev/test/preprod/prod environments with separate Teams channels:

```yaml
parameters:
  - name: environments
    type: object
    default:
      - { name: 'dev', baseUrl: 'https://devadmin-as-mtc.azurewebsites.net', webhookVar: 'TEAMS_WEBHOOK_DEV' }
      - { name: 'test', baseUrl: 'https://testadmin-as-mtc.azurewebsites.net', webhookVar: 'TEAMS_WEBHOOK_TEST' }
      - { name: 'preprod', baseUrl: 'https://pp-admin.multiplication-tables-check.service.gov.uk', webhookVar: 'TEAMS_WEBHOOK_PREPROD' }

trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

jobs:
  - ${{ each env in parameters.environments }}:
    - job: Test${{ capitalize(env.name) }}Admin
      displayName: 'Playwright - ${{ capitalize(env.name) }} Admin Tests'
      steps:
        - task: NodeTool@0
          inputs:
            versionSpec: '20.x'
        
        - script: npm ci
          workingDirectory: test/pupil-hpa
          displayName: 'Install dependencies'
        
        - script: npx playwright install --with-deps
          workingDirectory: test/pupil-hpa
          displayName: 'Install Playwright browsers'
        
        - script: npx playwright test --project=${{ env.name }}-admin
          workingDirectory: test/pupil-hpa
          displayName: 'Run ${{ env.name }} admin tests'
          env:
            TEAMS_WEBHOOK_URL: $(${{ env.webhookVar }})
            TEAMS_ENVIRONMENT: ${{ env.name }}
            TEAMS_NOTIFY_FAILURES_ONLY: 'false'
        
        - task: PublishTestResults@2
          condition: always()
          inputs:
            testResultsFormat: 'JUnit'
            testResultsFiles: 'test/pupil-hpa/test-results/**/*.xml'
```

### Step 4: Create Secret Variables for Each Environment

In **Pipelines → Variables:**

| Variable | Value | Secret? |
|----------|-------|---------|
| `TEAMS_WEBHOOK_DEV` | Dev channel webhook URL | ✅ Yes |
| `TEAMS_WEBHOOK_TEST` | Test channel webhook URL | ✅ Yes |
| `TEAMS_WEBHOOK_PREPROD` | Preprod channel webhook URL | ✅ Yes |

---

## 📊 Message Examples

### Success (All Tests Passed)
```
✅ Playwright Tests PASSED
Environment: test
Status: passed
Total Tests: 550
Passed: 550
Duration: 120s
Projects: test-admin, test-check, test-accessibility
```

### Failure (Some Tests Failed)
```
❌ Playwright Tests FAILED
Environment: test
Status: failed
Total Tests: 550
Passed: 540
Failed: 10
Duration: 135s
Projects: test-admin, test-check, test-accessibility
```

### Flaky Tests
```
❌ Playwright Tests FAILED
Environment: test
Status: failed
Total Tests: 550
Passed: 540
Failed: 5
Flaky: 5
Duration: 145s
Projects: test-admin, test-check, test-accessibility
```

---

## 🔒 Security Best Practices

1. **Store webhook URLs as Azure Secrets**
   - Use `$(TEAMS_WEBHOOK_URL)` reference (never paste raw URL)
   - Enable "Keep this value secret" in Variables

2. **Restrict Pipeline Access**
   - Only maintainers should access the pipeline and variables
   - Use branch protection rules

3. **Rotate Webhooks Periodically**
   - If a webhook is compromised, delete and create a new one
   - Teams webhooks don't have expiration; rotate every 3–6 months

4. **Audit Log**
   - Teams webhooks don't have built-in audit logs
   - Monitor unexpected messages in your channel

---

## 🐛 Troubleshooting

### Tests Pass Locally but Teams Doesn't Receive Notification

**Cause:** `TEAMS_WEBHOOK_URL` not set

**Solution:**
```bash
# Check if variable is set
echo $TEAMS_WEBHOOK_URL

# If empty, export it
export TEAMS_WEBHOOK_URL="https://outlook.webhook.office.com/webhookb2/..."
```

### Notification Shows "unknown" Environment

**Cause:** `TEAMS_ENVIRONMENT` not set

**Solution:**
```bash
export TEAMS_ENVIRONMENT=test
npx playwright test
```

### Teams Webhook Returns 400 / 401 Error

**Cause:** Invalid or expired webhook URL

**Solution:**
1. Verify webhook URL is correct (no extra spaces)
2. Recreate the webhook in Teams
3. Update Azure DevOps secret variable

### In Azure Pipeline: Tests Pass but No Teams Notification

**Cause:** Missing `env:` section or webhook variable not passed

**Solution:**
```yaml
- script: npx playwright test --project=test-admin
  env:
    TEAMS_WEBHOOK_URL: $(TEAMS_WEBHOOK_URL)  # ← Required
    TEAMS_ENVIRONMENT: test
```

### Notifications Only on Failure

**Feature:** Use `TEAMS_NOTIFY_FAILURES_ONLY` to reduce noise

```yaml
env:
  TEAMS_WEBHOOK_URL: $(TEAMS_WEBHOOK_URL)
  TEAMS_ENVIRONMENT: test
  TEAMS_NOTIFY_FAILURES_ONLY: 'true'  # ← Only notify on failures
```

### Suppress Notifications for a Single Run

If you want the webhook configured but do not want any Teams message for a specific run:

```bash
TEAMS_DISABLE_NOTIFICATIONS=true npx playwright test --project=test-admin
```

In Azure DevOps, set the same flag in the step `env:` block for that job only.

---

## 📈 Advanced: Per-Test-Project Notifications

If you want separate Teams channels per project (admin/check/accessibility):

```yaml
  - job: TestAdmin
    steps:
      # ... install steps ...
      - script: npx playwright test --project=test-admin
        env:
          TEAMS_WEBHOOK_URL: $(TEAMS_WEBHOOK_ADMIN)  # Separate webhook
          TEAMS_ENVIRONMENT: test
  
  - job: TestCheck
    steps:
      # ... install steps ...
      - script: npx playwright test --project=test-check
        env:
          TEAMS_WEBHOOK_URL: $(TEAMS_WEBHOOK_CHECK)  # Separate webhook
          TEAMS_ENVIRONMENT: test
  
  - job: TestAccessibility
    steps:
      # ... install steps ...
      - script: npx playwright test --project=test-accessibility
        env:
          TEAMS_WEBHOOK_URL: $(TEAMS_WEBHOOK_ACCESSIBILITY)  # Separate webhook
          TEAMS_ENVIRONMENT: test
```

---

## 📚 References

- [Teams Incoming Webhooks](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using)
- [Playwright Reporters](https://playwright.dev/docs/test-reporters)
- [Azure Pipelines Variables](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/variables)
- [MessageCard Format](https://docs.microsoft.com/en-us/outlook/actionable-messages/send-via-connectors)

---

## ✅ Checklist for Integration

When ready to integrate into Azure Pipelines:

- [ ] Create Teams Incoming Webhooks (dev/test/preprod channels)
- [ ] Add secret variables to Azure Pipelines (`TEAMS_WEBHOOK_*`)
- [ ] Update `azure-pipelines.yml` with Teams webhook env vars
- [ ] Test locally first: `export TEAMS_WEBHOOK_URL="..." && npm test`
- [ ] Run pipeline and verify Teams messages
- [ ] Document Teams channel in team wiki/runbook
- [ ] Set up per-environment notifications if desired
- [ ] Configure failure-only notifications if reducing noise
