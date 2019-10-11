CREATE TABLE [mtc_admin].[serviceMessage] (
  id int IDENTITY (1,1) NOT NULL,
  createdAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  updatedAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  version rowversion,
  recordedByUser_id int NOT NULL,
  updatedByUser_id int NULL,
  title nvarchar(max) NOT NULL,
  message nvarchar(max) NOT NULL,
  isDeleted bit NOT NULL DEFAULT 0,
  deletedByUser_id int NULL,
  CONSTRAINT [PK_serviceMessage] PRIMARY KEY CLUSTERED ([id] ASC)
  WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      IGNORE_DUP_KEY = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON
    )
)

ALTER TABLE [mtc_admin].[serviceMessage] WITH CHECK ADD CONSTRAINT [FK_serviceMessage_recordedByUser_id] FOREIGN KEY([recordedByUser_id])
REFERENCES [mtc_admin].[user] ([id])

ALTER TABLE [mtc_admin].[serviceMessage] WITH CHECK ADD CONSTRAINT [FK_serviceMessage_updatedByUser_id] FOREIGN KEY([updatedByUser_id])
REFERENCES [mtc_admin].[user] ([id])

ALTER TABLE [mtc_admin].[serviceMessage] WITH CHECK ADD CONSTRAINT [FK_serviceMessage_deletedByUser_id] FOREIGN KEY([deletedByUser_id])
REFERENCES [mtc_admin].[user] ([id])
