CREATE TABLE [mtc_admin].[pupilRestart] (
  id int IDENTITY (1,1) NOT NULL,
  pupil_id int NOT NULL,
  pupilRestartCode_id int NOT NULL,
  createdAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  updatedAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  version rowversion,
  recordedByUser nvarchar(50) NOT NULL,
  reason nvarchar(50) NOT NULL,
  didNotCompleteInformation nvarchar(100) NULL,
  furtherInformation nvarchar(1000) NULL,
  isDeleted bit NOT NULL DEFAULT 0,
  deletedByUser datetimeoffset(3),
  CONSTRAINT [PK_pupilRestart] PRIMARY KEY CLUSTERED ([id] ASC)
  WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      IGNORE_DUP_KEY = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON
    )
)
