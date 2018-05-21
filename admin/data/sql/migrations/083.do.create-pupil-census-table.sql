CREATE TABLE [mtc_admin].[pupilCensus] (
  id        INT IDENTITY (1, 1) NOT NULL,
  name      [nvarchar](300) NOT NULL,
  blobFileName [nvarchar](300) NOT NULL,
  status [nvarchar](50) NOT NULL,
  isDeleted [BIT] NOT NULL DEFAULT 0,
  createdAt DATETIMEOFFSET(3)   NOT NULL DEFAULT GETUTCDATE(),
  updatedAt DATETIMEOFFSET(3)   NOT NULL DEFAULT GETUTCDATE()
);
CREATE UNIQUE INDEX pupilCensus_blobFileName_uindex ON [mtc_admin].[pupilCensus] ([blobFileName]);