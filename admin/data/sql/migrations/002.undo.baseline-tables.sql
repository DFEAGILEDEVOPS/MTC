ALTER TABLE [admin].settingsLog DROP CONSTRAINT FK_settingsLog_user_id
ALTER TABLE [admin].question DROP CONSTRAINT FK_question_checkForm_id
ALTER TABLE [admin].pupilLogonEvent DROP CONSTRAINT FK_pupilLogonEvent_pupil_id
ALTER TABLE [admin].pupilFeedback DROP CONSTRAINT FK_pupilFeedback_check_id
ALTER TABLE [admin].pupilAttendance DROP CONSTRAINT FK_pupilAttendance_user_id
ALTER TABLE [admin].pupilAttendance DROP CONSTRAINT FK_pupilAttendance_attendanceCode_id
ALTER TABLE [admin].pupilAttendance DROP CONSTRAINT FK_pupilAttendance_pupil_id
ALTER TABLE [admin].hdf DROP CONSTRAINT FK_hdf_school_id
ALTER TABLE [admin].hdf DROP CONSTRAINT FK_hdf_user_id
ALTER TABLE [admin].hdf DROP CONSTRAINT FK_hdf_checkWindow_id
ALTER TABLE [admin].adminLogonEvent DROP CONSTRAINT FK_adminLogonEvent_user_id
ALTER TABLE [admin].[check] DROP CONSTRAINT FK_check_pupil_id
ALTER TABLE [admin].[check] DROP CONSTRAINT FK_check_checkWindow_id
ALTER TABLE [admin].[check] DROP CONSTRAINT FK_check_checkForm_id
ALTER TABLE [admin].[user] DROP CONSTRAINT FK_user_school_id
ALTER TABLE [admin].[user] DROP CONSTRAINT FK_user_role_id
ALTER TABLE [admin].pupil DROP CONSTRAINT FK_pupil_school_id
ALTER TABLE [admin].checkForm DROP CONSTRAINT FK_checkForm_checkWindow_id
DROP TABLE [admin].settingsLog
DROP TABLE [admin].question
DROP TABLE [admin].pupilLogonEvent
DROP TABLE [admin].pupilFeedback
DROP TABLE [admin].pupilAttendance
DROP TABLE [admin].hdf
DROP TABLE [admin].adminLogonEvent
DROP TABLE [admin].[check]
DROP TABLE [admin].[user]
DROP TABLE [admin].pupil
DROP TABLE [admin].checkForm
DROP TABLE [admin].school
DROP TABLE [admin].[role]
DROP TABLE [admin].checkWindow
DROP TABLE [admin].attendanceCode
DROP TABLE [admin].settings
