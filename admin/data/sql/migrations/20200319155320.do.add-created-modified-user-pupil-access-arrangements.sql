EXEC sp_RENAME 'mtc_admin.FK_pupilAccessArrangements_recordedBy_user_id' , N'FK_pupilAccessArrangements_createdBy_userId', N'OBJECT'
EXEC sp_RENAME 'mtc_admin.pupilAccessArrangements.recordedBy_user_id' , 'createdBy_userId', 'COLUMN'

ALTER TABLE [mtc_admin].[pupilAccessArrangements] ADD modifiedBy_userId INT NULL
ALTER TABLE [mtc_admin].[pupilAccessArrangements] WITH CHECK ADD CONSTRAINT [FK_pupilAccessArrangements_modifiedBy_userId] FOREIGN KEY([modifiedBy_userId])
REFERENCES [mtc_admin].[user] ([id])
