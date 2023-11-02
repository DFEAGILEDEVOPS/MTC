ALTER TABLE [mtc_admin].[serviceMessageServiceMessageArea] ADD CONSTRAINT [FK_serviceMessageId] FOREIGN KEY (serviceMessageId) REFERENCES mtc_admin.serviceMessage (id);
GO

CREATE TABLE [mtc_admin].[serviceMessage] (
  id int NOT NULL IDENTITY(1, 1),
  createdAt datetimeoffset(7) NOT NULL CONSTRAINT DF_serviceMessage_createdAt DEFAULT (getutcdate()),
  updatedAt datetimeoffset(7) NOT NULL CONSTRAINT DF_serviceMessage_updatedAt DEFAULT (getutcdate()),
  version timestamp NOT NULL,
  createdByUser_id int NOT NULL,
  title nvarchar(max) NOT NULL,
  message nvarchar(max) NOT NULL,
  borderColourLookupId int NOT NULL,
  CONSTRAINT PK_serviceMessage PRIMARY KEY (id),
  CONSTRAINT FK_serviceMessage_borderColourLookupId_serviceMessageBorderColourLookup_id FOREIGN KEY (borderColourLookupId) REFERENCES mtc_admin.serviceMessageBorderColourLookup (id),
  CONSTRAINT FK_serviceMessage_createdByUser_id FOREIGN KEY (createdByUser_id) REFERENCES mtc_admin.[user] (id)
);
