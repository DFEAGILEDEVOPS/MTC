-- Add the FK referencing this table back in.
ALTER TABLE [mtc_admin].[serviceMessageServiceMessageArea] DROP CONSTRAINT [FK_serviceMessageId];
GO

DROP TABLE IF EXISTS [mtc_admin].[serviceMessage];
