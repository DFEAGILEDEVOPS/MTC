# PS Report Performance Optimisations

## Overview

Performance improvements to the Psychometric Report (PS Report) generation pipeline, reducing processing time from **7 hours to ~1 hour** for 500k pupils across 16k schools.

---

## Summary of Changes

| Optimisation               | Impact | Description |
|----------------------------|--------|-------------|
| Bulk Database Queries      | 5-10x faster | Reduced from 7+ queries per pupil to 4 queries per batch |
| Output Message Batching    | 500x fewer messages | Batch pupil results before sending to Service Bus |
| Increased Pupil Batch Size | 2-3x faster | Process more pupils in parallel per school |

---

## Environment Variables

Configure these in the **Azure Portal** under your Function App → Configuration → Application Settings.

### New Variables

| Variable | Default | Recommended | Description |
|----------|---------|-------------|-------------|
| `PS_REPORT_OUTPUT_MESSAGE_BATCH_SIZE` | 500 | 500-1000 | Number of pupil results batched into a single Service Bus message. Higher = fewer messages, faster throughput. |

### Updated Variables

| Variable | Old Default | New Default | Description |
|----------|-------------|-------------|-------------|
| `PS_REPORT_PUPIL_BATCH_SIZE` | 10 | 100 | Number of pupils processed in parallel per database batch. |

---

## How to Configure in Azure Portal

1. Navigate to **Azure Portal** → **App Services** → Select your app e.g ppadmin-as-mtc for preprod
2. Go to **Settings** → **Environment Variables**
3Add or update the following:

```
PS_REPORT_PUPIL_BATCH_SIZE = 100
PS_REPORT_OUTPUT_MESSAGE_BATCH_SIZE = 500
```

5. Click **Save** and confirm the restart

---

## Technical Details

### Before: Individual Processing (7 hours)

```
For each school (16k):
  For each pupil (~31 avg):
    → 7+ database queries per pupil
    → 1 Service Bus message per pupil

Total: ~500k database round-trips + 500k Service Bus messages
```

### After: Bulk Processing (1 hour)

```
For each school (16k):
  → 4 bulk database queries (all pupils in batch)
  → Process pupils in parallel (batch size 100)
  → 1 Service Bus message per 500 pupils

Total: ~64k database queries + ~1k Service Bus messages
```

---

## Files Modified

| File | Change |
|------|--------|
| `tslib/src/config.ts` | Added `OutputMessageBatchSize` config, increased default `PupilProcessingBatchSize` from 10 to 100 |
| `tslib/src/functions-ps-report/common/ps-report-service-bus-messages.ts` | Added `PsReportBatchMessage` interface for batched output |
| `tslib/src/functions-ps-report/ps-report-2-pupil-data/ps-report.service.ts` | Batch output results before sending to Service Bus queue |
| `tslib/src/functions-ps-report/ps-report-2-pupil-data/ps-report.data.service.ts` | Added `getBulkCheckData()` method for bulk database queries |
| `tslib/src/functions-ps-report/ps-report-2-pupil-data/index.ts` | Updated output type to `PsReportBatchMessage[]` |
| `tslib/src/functions-ps-report/ps-report-3b-stage-csv-file/index.ts` | Updated to unpack batched messages |

---

## Tuning Guide

### If report is still slow

Increase batch sizes (monitor memory usage):

```
PS_REPORT_PUPIL_BATCH_SIZE = 200
PS_REPORT_OUTPUT_MESSAGE_BATCH_SIZE = 1000
PS_REPORT_STAGING_POLL_INTERVAL = 1
```

### If experiencing memory issues

Decrease batch sizes:

```
PS_REPORT_PUPIL_BATCH_SIZE = 50
PS_REPORT_OUTPUT_MESSAGE_BATCH_SIZE = 250
```

### If experiencing database connection pool issues

Decrease pupil batch size:

```
PS_REPORT_PUPIL_BATCH_SIZE = 50
```

---

## Monitoring

Check logs for performance metrics:

```
ps-report-2-pupil-data: PsReportService: Processing batch X/Y (Z pupils) for school...
ps-report-2-pupil-data: School [name] processing complete: X successful, Y failed (Zms total, Wms avg per pupil). Batched into N messages...
ps-report-3b-stage-csv-file: received X batch messages containing total Y pupils for processing
```

---

## Rollback

To revert to original behavior, set:

```
PS_REPORT_PUPIL_BATCH_SIZE = 10
PS_REPORT_OUTPUT_MESSAGE_BATCH_SIZE = 1
```

**Note:** Setting `PS_REPORT_OUTPUT_MESSAGE_BATCH_SIZE = 1` will send individual pupil messages (original behavior) but Stage 3 now expects batched format, so a code rollback would also be required for full reversion.
