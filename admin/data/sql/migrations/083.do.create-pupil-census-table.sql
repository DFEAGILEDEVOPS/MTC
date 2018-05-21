CREATE TABLE [mtc_admin].[pupilCensus] (
  id        INT IDENTITY (1, 1) NOT NULL,
  name      [nvarchar](MAX) NOT NULL,
  blobFileName [nvarchar](300) NOT NULL,
  createdAt DATETIMEOFFSET(3)   NOT NULL DEFAULT GETUTCDATE(),
  updatedAt DATETIMEOFFSET(3)   NOT NULL DEFAULT GETUTCDATE(),
  status [nvarchar](50) NOT NULL,
  isDeleted [BIT] NOT NULL DEFAULT 0,
  isValidationSuccessful [BIT],
  isCompleted [BIT],
  errorMessage [nvarchar](MAX)
);
CREATE UNIQUE INDEX pupilCensus_blobFileName_uindex ON [mtc_admin].[pupilCensus] ([blobFileName]);
