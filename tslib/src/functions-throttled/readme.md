# Throttled functions

Any functions defined in this directory will be housed in the `func-throttled` app,
which will be configured to process data in sequence, rather than scaling on demand.

## Check DLQ reconciliation

The Tech Support page reconciles **only the `check-submission` dead-letter queue**.
It does not replay submissions, alter results or inspect the compressed pupil archive.
Messages are identified using their top-level `checkCode` and `schoolUUID`.
The submission version is ignored: even an unsupported or missing version can be
removed if the matching SQL check has `resultsSynchronised = 1`. No separate result
row or valid archive is required. Messages without usable identifiers, or without
confirmed SQL success for the matching school, are retained for manual review.

### Operation

1. Apply the database migrations (`cd db && yarn migrate`) and rebuild/restart
	`admin` and `func-throttled`.
2. Open Tech Support > Reconcile Check DLQ and start a preview. Peeking is
	non-destructive. Review the persisted, paginated message audit.
3. A completed preview with eligible messages exposes a confirmation checkbox and
	cleanup action. Cleanup is explicitly requested; there is no automatic daily deletion.
4. Cleanup rechecks the same check and school and `resultsSynchronised = 1`
	before completing each eligible message, regardless of the failed message version.
	Partial or interrupted runs must be reviewed and followed by a fresh preview.

Execution is manual-only. The function-key-protected `POST /api/dlq-reconciliation`
creates an audited run and executes that exact run within the HTTP request, returning
200 with its run ID. `GET` lists recent runs, or accepts `runId` and `page` for audit
results (50 rows per page); it never executes work. Requests carry the authenticated
admin operator ID. There is no reconciliation timer registration or scheduled polling.
Restart the function host after rebuilding to unload any previously registered timer.
The admin caller allows up to 210 seconds for a response; external proxy timeouts may
be shorter. If a request times out, inspect run history before retrying: settlement
may still have occurred, and only confirmed outcomes should be treated as removals.
Manual operation still requires both audit-table migrations and function-user grants.
Missing audit tables return 503 with migration guidance, not a request to bypass auditing.

### Safety and Limits

Runs are bounded to 1,000 messages and approximately two minutes of work. Hitting a
limit is reported as Partial, not as a complete scan. A partial preview cannot be
used for cleanup. Larger backlogs require a separately reviewed limit change.
Preview advances by sequence number, not message ID; duplicate message IDs are
audited separately. Cleanup holds non-candidate locks until the bounded sweep ends,
with five-minute automatic renewal, preventing immediate redelivery from starving
later candidates. Retained locks are released on exit and the receiver is closed.
Messages missing sequence numbers stop processing safely. Concurrent receivers or
lock loss can make a cleanup partial; these are never silently treated as removals.

A SQL unique index permits one active run per queue. Runs heartbeat between batches;
when another manual run is requested, running jobs with no heartbeat for ten minutes
or queued jobs older than ten minutes are marked Interrupted before the new run is
created. No timer is needed to recover these stale entries. Message
removal intent is persisted before settlement. A timeout/crash after the intent
is recorded leaves an Unknown outcome, even if Service Bus accepted completion.
SQL audit and Service Bus settlement cannot be made one atomic transaction: review
unknown outcomes using a new preview; absence is not retroactively claimed as a
confirmed deletion. No archive or answers are stored in the audit tables.

Before/after DLQ counts are snapshots and may differ from the inventory because of
concurrent processing. Queue statistics require Service Bus management access;
without it the counts are Unavailable, not zero. SQL access, the new function-user
grants, and `AZURE_SERVICE_BUS_CONNECTION_STRING` are required. The admin caller
uses the configured throttled host and master key, calling `/api` rather than
`/admin/functions`. Plan audit retention with operational owners before production
rollout; no automatic audit deletion is included.

The audit table displays Submission Date using Service Bus `enqueuedTimeUtc`,
stored as `submittedAt` and displayed in UTC. This is the time this message entered
the queue, not a client-reported completion time or reconciliation time. Replayed
messages have their own enqueue time. Migration `20261020150000` adds the nullable
column; old audit rows remain Unavailable until a new preview captures the metadata.
The separate `checkedAt` timestamp is retained for auditing and progress counts.
