ALTER TABLE [mtc_admin].[pupil]
  DROP CONSTRAINT [FK_pupil_lastModifiedBy_userId]

ALTER TABLE [mtc_admin].[pupil]
  DROP COLUMN lastModifiedBy_userId
