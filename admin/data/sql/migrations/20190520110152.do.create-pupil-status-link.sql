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
    )
)
