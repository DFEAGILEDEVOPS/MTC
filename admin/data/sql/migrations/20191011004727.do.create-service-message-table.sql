CREATE TABLE [mtc_admin].[serviceMessage] (
  id int NOT NULL DEFAULT 1,
  createdAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  updatedAt datetimeoffset(3) NOT NULL DEFAULT GETUTCDATE(),
  version rowversion,
  createdByUser_id int NOT NULL,
  title nvarchar(max) NOT NULL,
  message nvarchar(max) NOT NULL,
  CONSTRAINT [PK_serviceMessage] PRIMARY KEY (id),
  CONSTRAINT [CK_serviceMessage_Locked] CHECK (id=1)
)

ALTER TABLE [mtc_admin].[serviceMessage] WITH CHECK ADD CONSTRAINT [FK_serviceMessage_createdByUser_id] FOREIGN KEY([createdByUser_id])
REFERENCES [mtc_admin].[user] ([id])
