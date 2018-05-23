CREATE TABLE [mtc_admin].[pupilCensus] (
  id        INT IDENTITY (1, 1) NOT NULL,
  urlSlug [uniqueidentifier] NOT NULL DEFAULT (newid()),
  name      [nvarchar](MAX) NOT NULL,
  blobFileName [nvarchar](300) NOT NULL,
  createdAt DATETIMEOFFSET(3)   NOT NULL DEFAULT GETUTCDATE(),
  updatedAt DATETIMEOFFSET(3)   NOT NULL DEFAULT GETUTCDATE(),
  version rowversion,
  jobStatusCode char(3) NOT NULL,
  isDeleted [BIT] NOT NULL DEFAULT 0,
  [output]    [nvarchar](MAX),
  [errorOutput]    [nvarchar](MAX),
);
CREATE UNIQUE INDEX pupilCensus_blobFileName_uindex ON [mtc_admin].[pupilCensus] ([blobFileName]);

ALTER TABLE [mtc_admin].[pupilCensus] WITH CHECK ADD CONSTRAINT [FK_pupilCensus_jobStatus_code] FOREIGN KEY([jobStatusCode])
REFERENCES [mtc_admin].[jobStatus] ([code])
