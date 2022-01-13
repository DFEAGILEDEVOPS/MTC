ALTER TABLE [mtc_admin].[school]
  DROP CONSTRAINT [FK_school_lastModifiedBy_userId]

ALTER TABLE [mtc_admin].[school]
  DROP COLUMN lastModifiedBy_userId
