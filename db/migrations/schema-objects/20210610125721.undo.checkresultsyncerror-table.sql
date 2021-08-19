ALTER TABLE [mtc_results].[checkResultSyncError]
DROP CONSTRAINT [FK_checkResultSyncError_check_id]

ALTER TABLE [mtc_results].[checkResultSyncError]
DROP CONSTRAINT [DF_checkResultSyncError_updatedAt_default]

ALTER TABLE [mtc_results].[checkResultSyncError]
DROP CONSTRAINT [DF_checkResultSyncError_createdAt_default]

DROP TRIGGER [mtc_results].[checkResultSyncErrorUpdatedAtTrigger]

DROP TABLE [mtc_results].[checkResultSyncError]
