CREATE TABLE [mtc_admin].[pupilAccessArrangements] (
  id int IDENTITY (1,1) NOT NULL,
  pupil_id int NOT NULL,
  accessArrangements_ids nvarchar(50) NOT NULL,
  questionReaderReasons_id int NULL,
  createdAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  updatedAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  version rowversion,
  recordedBy_user_id int NOT NULL,
  inputAssistanceInformation nvarchar(1000) NULL,
  questionReaderOtherInformation nvarchar(1000) NULL,
  CONSTRAINT [PK_pupilAccessArrangements] PRIMARY KEY CLUSTERED ([id] ASC)
  WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      IGNORE_DUP_KEY = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON
    )
)

ALTER TABLE [mtc_admin].[pupilAccessArrangements] WITH CHECK ADD CONSTRAINT [FK_pupilAccessArrangements_questionReaderReasons_id] FOREIGN KEY([questionReaderReasons_id])
REFERENCES [mtc_admin].[questionReaderReasons] ([id])

ALTER TABLE [mtc_admin].[pupilAccessArrangements] WITH CHECK ADD CONSTRAINT [FK_pupilAccessArrangements_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [mtc_admin].[pupil] ([id])

ALTER TABLE [mtc_admin].[pupilAccessArrangements] WITH CHECK ADD CONSTRAINT [FK_pupilAccessArrangements_recordedBy_user_id] FOREIGN KEY([recordedBy_user_id])
REFERENCES [mtc_admin].[user] ([id])
