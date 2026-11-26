CREATE TABLE [mtc_admin].[checkStartAcknowledgement] (
  [attemptId] UNIQUEIDENTIFIER NOT NULL,
  [check_id] INT NOT NULL,
  [acknowledgedAt] DATETIMEOFFSET(3) NOT NULL CONSTRAINT [DF_checkStartAcknowledgement_acknowledgedAt] DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT [PK_checkStartAcknowledgement] PRIMARY KEY ([attemptId]),
  CONSTRAINT [FK_checkStartAcknowledgement_check] FOREIGN KEY ([check_id]) REFERENCES [mtc_admin].[check] ([id])
);

CREATE INDEX [IX_checkStartAcknowledgement_check_id] ON [mtc_admin].[checkStartAcknowledgement] ([check_id]);
