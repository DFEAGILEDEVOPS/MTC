IF OBJECT_ID('mtc_admin.dlqReconciliationRun', 'U') IS NULL
BEGIN
  CREATE TABLE mtc_admin.dlqReconciliationRun (
    runId uniqueidentifier NOT NULL PRIMARY KEY,
    queueName varchar(64) NOT NULL,
    mode varchar(10) NOT NULL CHECK (mode IN ('preview', 'cleanup')),
    previewRunId uniqueidentifier NULL REFERENCES mtc_admin.dlqReconciliationRun(runId),
    requestedBy nvarchar(128) NOT NULL,
    status varchar(24) NOT NULL DEFAULT 'Queued',
    createdAt datetime2 NOT NULL DEFAULT SYSUTCDATETIME(),
    heartbeatAt datetime2 NULL,
    finishedAt datetime2 NULL,
    deadLetterCountBefore int NULL,
    deadLetterCountAfter int NULL,
    message nvarchar(512) NULL
  );
  CREATE UNIQUE INDEX IX_dlqReconciliationRun_activeQueue
    ON mtc_admin.dlqReconciliationRun(queueName) WHERE finishedAt IS NULL;
END;

IF OBJECT_ID('mtc_admin.dlqReconciliationItem', 'U') IS NULL
BEGIN
  CREATE TABLE mtc_admin.dlqReconciliationItem (
    runId uniqueidentifier NOT NULL REFERENCES mtc_admin.dlqReconciliationRun(runId),
    sequenceNumber varchar(20) NOT NULL,
    messageId nvarchar(128) NOT NULL,
    checkCode uniqueidentifier NULL,
    schoolUUID uniqueidentifier NULL,
    outcome varchar(96) NOT NULL,
    checkedAt datetime2 NULL,
    PRIMARY KEY (runId, sequenceNumber)
  );
END;