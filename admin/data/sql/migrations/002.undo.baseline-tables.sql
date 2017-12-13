ALTER TABLE [mtc_admin].settingsLog DROP CONSTRAINT FK_settingsLog_user_id
ALTER TABLE [mtc_admin].question DROP CONSTRAINT FK_question_checkForm_id
ALTER TABLE [mtc_admin].pupilLogonEvent DROP CONSTRAINT FK_pupilLogonEvent_pupil_id
ALTER TABLE [mtc_admin].pupilFeedback DROP CONSTRAINT FK_pupilFeedback_check_id
ALTER TABLE [mtc_admin].pupilAttendance DROP CONSTRAINT FK_pupilAttendance_user_id
ALTER TABLE [mtc_admin].pupilAttendance DROP CONSTRAINT FK_pupilAttendance_attendanceCode_id
ALTER TABLE [mtc_admin].pupilAttendance DROP CONSTRAINT FK_pupilAttendance_pupil_id
ALTER TABLE [mtc_admin].hdf DROP CONSTRAINT FK_hdf_school_id
ALTER TABLE [mtc_admin].hdf DROP CONSTRAINT FK_hdf_user_id
ALTER TABLE [mtc_admin].hdf DROP CONSTRAINT FK_hdf_checkWindow_id
ALTER TABLE [mtc_admin].adminLogonEvent DROP CONSTRAINT FK_adminLogonEvent_user_id
ALTER TABLE [mtc_admin].[check] DROP CONSTRAINT FK_check_pupil_id
ALTER TABLE [mtc_admin].[check] DROP CONSTRAINT FK_check_checkWindow_id
ALTER TABLE [mtc_admin].[check] DROP CONSTRAINT FK_check_checkForm_id
ALTER TABLE [mtc_admin].[user] DROP CONSTRAINT FK_user_school_id
ALTER TABLE [mtc_admin].[user] DROP CONSTRAINT FK_user_role_id
ALTER TABLE [mtc_admin].pupil DROP CONSTRAINT FK_pupil_school_id
ALTER TABLE [mtc_admin].checkForm DROP CONSTRAINT FK_checkForm_checkWindow_id
DROP TABLE [mtc_admin].settingsLog
DROP TABLE [mtc_admin].question
DROP TABLE [mtc_admin].pupilLogonEvent
DROP TABLE [mtc_admin].pupilFeedback
DROP TABLE [mtc_admin].pupilAttendance
DROP TABLE [mtc_admin].hdf
DROP TABLE [mtc_admin].adminLogonEvent
DROP TABLE [mtc_admin].[check]
DROP TABLE [mtc_admin].[user]
DROP TABLE [mtc_admin].pupil
DROP TABLE [mtc_admin].checkForm
DROP TABLE [mtc_admin].school
DROP TABLE [mtc_admin].[role]
DROP TABLE [mtc_admin].checkWindow
DROP TABLE [mtc_admin].attendanceCode
DROP TABLE [mtc_admin].settings
