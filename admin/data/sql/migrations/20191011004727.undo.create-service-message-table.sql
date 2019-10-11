ALTER TABLE [mtc_admin].serviceMessage DROP CONSTRAINT FK_serviceMessage_recordedByUser_id
ALTER TABLE [mtc_admin].serviceMessage DROP CONSTRAINT FK_serviceMessage_updatedByUser_id
ALTER TABLE [mtc_admin].serviceMessage DROP CONSTRAINT FK_serviceMessage_deletedByUser_id

DROP TABLE [mtc_admin].[serviceMessage]
