CREATE TABLE [mtc_admin].[job] (
  id        INT IDENTITY (1, 1) NOT NULL,
  urlSlug [uniqueidentifier] NOT NULL DEFAULT (newid()),
  input      [nvarchar](MAX) NOT NULL,
  createdAt DATETIMEOFFSET(3)   NOT NULL DEFAULT GETUTCDATE(),
  updatedAt DATETIMEOFFSET(3)   NOT NULL DEFAULT GETUTCDATE(),
  version rowversion,
  jobStatus_id int NOT NULL,
  jobType_id int NOT NULL,
  [jobOutput]    [nvarchar](MAX),
  [errorOutput]    [nvarchar](MAX),
);

ALTER TABLE [mtc_admin].[job] WITH CHECK ADD CONSTRAINT [FK_job_jobStatus_id] FOREIGN KEY([jobStatus_id])
REFERENCES [mtc_admin].[jobStatus] ([id])

ALTER TABLE [mtc_admin].[job] WITH CHECK ADD CONSTRAINT [FK_job_jobType_id] FOREIGN KEY([jobType_id])
REFERENCES [mtc_admin].[jobType] ([id])

EXEC mtc_admin.spGenAuditTriggers
