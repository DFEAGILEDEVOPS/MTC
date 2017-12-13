ALTER TABLE [mtc].settingsLog DROP CONSTRAINT FK_settingsLog_user_id
ALTER TABLE [mtc].question DROP CONSTRAINT FK_question_checkForm_id
ALTER TABLE [mtc].pupilLogonEvent DROP CONSTRAINT FK_pupilLogonEvent_pupil_id
ALTER TABLE [mtc].pupilFeedback DROP CONSTRAINT FK_pupilFeedback_check_id
ALTER TABLE [mtc].pupilAttendance DROP CONSTRAINT FK_pupilAttendance_user_id
ALTER TABLE [mtc].pupilAttendance DROP CONSTRAINT FK_pupilAttendance_attendanceCode_id
ALTER TABLE [mtc].pupilAttendance DROP CONSTRAINT FK_pupilAttendance_pupil_id
ALTER TABLE [mtc].hdf DROP CONSTRAINT FK_hdf_school_id
ALTER TABLE [mtc].hdf DROP CONSTRAINT FK_hdf_user_id
ALTER TABLE [mtc].hdf DROP CONSTRAINT FK_hdf_checkWindow_id
ALTER TABLE [mtc].adminLogonEvent DROP CONSTRAINT FK_adminLogonEvent_user_id
ALTER TABLE [mtc].[check] DROP CONSTRAINT FK_check_pupil_id
ALTER TABLE [mtc].[check] DROP CONSTRAINT FK_check_checkWindow_id
ALTER TABLE [mtc].[check] DROP CONSTRAINT FK_check_checkForm_id
ALTER TABLE [mtc].[user] DROP CONSTRAINT FK_user_school_id
ALTER TABLE [mtc].[user] DROP CONSTRAINT FK_user_role_id
ALTER TABLE [mtc].pupil DROP CONSTRAINT FK_pupil_school_id
ALTER TABLE [mtc].checkForm DROP CONSTRAINT FK_checkForm_checkWindow_id
DROP TABLE [mtc].settingsLog
DROP TABLE [mtc].question
DROP TABLE [mtc].pupilLogonEvent
DROP TABLE [mtc].pupilFeedback
DROP TABLE [mtc].pupilAttendance
DROP TABLE [mtc].hdf
DROP TABLE [mtc].adminLogonEvent
DROP TABLE [mtc].[check]
DROP TABLE [mtc].[user]
DROP TABLE [mtc].pupil
DROP TABLE [mtc].checkForm
DROP TABLE [mtc].school
DROP TABLE [mtc].[role]
DROP TABLE [mtc].checkWindow
DROP TABLE [mtc].attendanceCode
DROP TABLE [mtc].settings
