ALTER TABLE [mtc_admin].pupilRestart DROP CONSTRAINT FK_pupilRestart_pupilRestartCode_id
ALTER TABLE [mtc_admin].pupilRestart DROP CONSTRAINT FK_pupilRestart_pupil_id
ALTER TABLE [mtc_admin].pupilRestart DROP CONSTRAINT FK_pupilRestart_recordedByUser_id
ALTER TABLE [mtc_admin].pupilRestart DROP CONSTRAINT FK_pupilRestart_deletedByUser_id

DROP TABLE [mtc_admin].[pupilRestart]
