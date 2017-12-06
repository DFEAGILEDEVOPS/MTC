ALTER TABLE dbo.settingsLog DROP CONSTRAINT FK_settingsLog_user_id
ALTER TABLE dbo.question DROP CONSTRAINT FK_question_checkForm_id
ALTER TABLE dbo.pupilLogonEvent DROP CONSTRAINT FK_pupilLogonEvent_pupil_id
ALTER TABLE dbo.pupilFeedback DROP CONSTRAINT FK_pupilFeedback_check_id
ALTER TABLE dbo.pupilAttendance DROP CONSTRAINT FK_pupilAttendance_user_id
ALTER TABLE dbo.pupilAttendance DROP CONSTRAINT FK_pupilAttendance_attendanceCode_id
ALTER TABLE dbo.pupilAttendance DROP CONSTRAINT FK_pupilAttendance_pupil_id
ALTER TABLE dbo.hdf DROP CONSTRAINT FK_hdf_school_id
ALTER TABLE dbo.hdf DROP CONSTRAINT FK_hdf_user_id
ALTER TABLE dbo.hdf DROP CONSTRAINT FK_hdf_checkWindow_id
ALTER TABLE dbo.adminLogonEvent DROP CONSTRAINT FK_adminLogonEvent_user_id
ALTER TABLE dbo.[check] DROP CONSTRAINT FK_check_pupil_id
ALTER TABLE dbo.[check] DROP CONSTRAINT FK_check_checkWindow_id
ALTER TABLE dbo.[check] DROP CONSTRAINT FK_check_checkForm_id
ALTER TABLE dbo.[user] DROP CONSTRAINT FK_user_school_id
ALTER TABLE dbo.[user] DROP CONSTRAINT FK_user_role_id
ALTER TABLE dbo.pupil DROP CONSTRAINT FK_pupil_school_id
ALTER TABLE dbo.checkForm DROP CONSTRAINT FK_checkForm_checkWindow_id
DROP TABLE dbo.settingsLog
DROP TABLE dbo.question
DROP TABLE dbo.pupilLogonEvent
DROP TABLE dbo.pupilFeedback
DROP TABLE dbo.pupilAttendance
DROP TABLE dbo.hdf
DROP TABLE dbo.adminLogonEvent
DROP TABLE dbo.[check]
DROP TABLE dbo.[user]
DROP TABLE dbo.pupil
DROP TABLE dbo.checkForm
DROP TABLE dbo.school
DROP TABLE dbo.role
DROP TABLE dbo.checkWindow
DROP TABLE dbo.attendanceCode
DROP TABLE dbo.settings
