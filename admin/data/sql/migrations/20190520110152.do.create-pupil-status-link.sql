CREATE TABLE [mtc_admin].[pupilStatusLink] (
  id int IDENTITY (1,1) NOT NULL,
  pupil_id [int] NOT NULL,
  pupilStatus_id [int] NOT NULL,
  createdAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  updatedAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  CONSTRAINT [PK_pupilStatusLink] PRIMARY KEY CLUSTERED ([id] ASC)
    WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      IGNORE_DUP_KEY = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON
    ),
  CONSTRAINT [FK_pupilStatusLink_pupilStatus_id_pupilStatus_id]
    FOREIGN KEY (pupilStatus_id)
    REFERENCES [mtc_admin].[pupilStatus] (id),
  CONSTRAINT [FK_pupilStatusLink_pupil_id_pupil_id]
    FOREIGN KEY (pupil_id)
    REFERENCES [mtc_admin].[pupil] (id)
)
