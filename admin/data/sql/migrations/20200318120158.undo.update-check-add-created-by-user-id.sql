ALTER TABLE [mtc_admin].[check]
DROP CONSTRAINT [FK_check_createdBy_userId_fk];
ALTER TABLE [mtc_admin].[check]
DROP COLUMN createdBy_userId;
