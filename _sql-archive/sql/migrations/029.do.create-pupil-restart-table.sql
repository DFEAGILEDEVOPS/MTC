CREATE TABLE [mtc_admin].[pupilRestart] (
  id int IDENTITY (1,1) NOT NULL,
  pupil_id int NOT NULL,
  pupilRestartCode_id int NOT NULL,
  createdAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  updatedAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  version rowversion,
  recordedByUser_id int NOT NULL,
  reason nvarchar(50) NOT NULL,
  didNotCompleteInformation nvarchar(100) NULL,
  furtherInformation nvarchar(1000) NULL,
  isDeleted bit NOT NULL DEFAULT 0,
  deletedByUser_id int NULL,
  CONSTRAINT [PK_pupilRestart] PRIMARY KEY CLUSTERED ([id] ASC)
  WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      IGNORE_DUP_KEY = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON
    )
)

ALTER TABLE [mtc_admin].[pupilRestart] WITH CHECK ADD CONSTRAINT [FK_pupilRestart_pupilRestartCode_id] FOREIGN KEY([pupilRestartCode_id])
REFERENCES [mtc_admin].[pupilRestartCode] ([id])

ALTER TABLE [mtc_admin].[pupilRestart] WITH CHECK ADD CONSTRAINT [FK_pupilRestart_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [mtc_admin].[pupil] ([id])

ALTER TABLE [mtc_admin].[pupilRestart] WITH CHECK ADD CONSTRAINT [FK_pupilRestart_recordedByUser_id] FOREIGN KEY([recordedByUser_id])
REFERENCES [mtc_admin].[user] ([id])

ALTER TABLE [mtc_admin].[pupilRestart] WITH CHECK ADD CONSTRAINT [FK_pupilRestart_deletedByUser_id] FOREIGN KEY([deletedByUser_id])
REFERENCES [mtc_admin].[user] ([id])
