CREATE TABLE [mtc_admin].[job] (
  id        INT IDENTITY (1, 1) NOT NULL,
  urlSlug [uniqueidentifier] NOT NULL DEFAULT (newid()),
  input      [nvarchar](MAX) NOT NULL,
  createdAt DATETIMEOFFSET(3)   NOT NULL DEFAULT GETUTCDATE(),
  updatedAt DATETIMEOFFSET(3)   NOT NULL DEFAULT GETUTCDATE(),
  version rowversion,
  jobStatusCode char(3) NOT NULL,
  jobTypeCode char(3) NOT NULL,
  [output]    [nvarchar](MAX),
  [errorOutput]    [nvarchar](MAX),
);

ALTER TABLE [mtc_admin].[job] WITH CHECK ADD CONSTRAINT [FK_job_jobStatus_code] FOREIGN KEY([jobStatusCode])
REFERENCES [mtc_admin].[jobStatus] ([code])

ALTER TABLE [mtc_admin].[job] WITH CHECK ADD CONSTRAINT [FK_job_jobType_code] FOREIGN KEY([jobTypeCode])
REFERENCES [mtc_admin].[jobType] ([code])

EXEC mtc_admin.spGenAuditTriggers
