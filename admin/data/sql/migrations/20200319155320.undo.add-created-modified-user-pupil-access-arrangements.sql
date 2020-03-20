ALTER TABLE [mtc_admin].pupilAccessArrangements DROP CONSTRAINT FK_pupilAccessArrangements_modifiedBy_userId
ALTER TABLE [mtc_admin].pupilAccessArrangements DROP COLUMN modifiedBy_userId

EXEC sp_RENAME 'mtc_admin.pupilAccessArrangements.createdBy_userId' , 'recordedBy_user_id', 'COLUMN'
EXEC sp_RENAME 'mtc_admin.FK_pupilAccessArrangements_createdBy_userId' , N'FK_pupilAccessArrangements_recordedBy_user_id', N'OBJECT'
