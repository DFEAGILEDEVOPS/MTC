SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_results].[checkResultSyncError](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
  [check_id] int NOT NULL,
  [errorMessage] nvarchar(max) NOT NULL,
  CONSTRAINT PK_checkResultSyncError PRIMARY KEY (id)
);
GO

ALTER TABLE [mtc_results].[checkResultSyncError] ADD CONSTRAINT [DF_checkResultSyncError_updatedAt_default]  DEFAULT (getutcdate())
    FOR [updatedAt];
GO

ALTER TABLE [mtc_results].[checkResultSyncError] ADD CONSTRAINT [DF_checkResultSyncError_createdAt_default]  DEFAULT (getutcdate())
    FOR [createdAt];
GO

CREATE TRIGGER [mtc_results].[checkResultSyncErrorUpdatedAtTrigger]
    ON [mtc_results].[checkResultSyncError]
    FOR UPDATE
    AS
BEGIN
    UPDATE [mtc_results].[checkResultSyncError]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [checkResultSyncError].id = inserted.id
END
GO

ALTER TABLE [mtc_results].[checkResultSyncError] ENABLE TRIGGER [checkResultSyncErrorUpdatedAtTrigger];
GO

ALTER TABLE [mtc_results].[checkResultSyncError]  WITH CHECK ADD CONSTRAINT [FK_checkResultSyncError_check_id] FOREIGN KEY([check_id])
REFERENCES [mtc_admin].[check] ([id])
GO
