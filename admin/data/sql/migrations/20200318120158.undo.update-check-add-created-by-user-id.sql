ALTER TABLE [mtc_admin].[check]
DROP CONSTRAINT [FK_check_createdBy_userId];
ALTER TABLE [mtc_admin].[check]
DROP COLUMN createdBy_userId;
