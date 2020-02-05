
-- append only table, no application lookups..
DROP INDEX IF EXISTS [mtc_admin].[adminLogonEvent].[adminLogonEvent_user_id_index];

-- check
CREATE INDEX check_pupil_id_index ON mtc_admin.[check] (pupil_id) WITH (DROP_EXISTING = ON)
CREATE INDEX check_checkForm_id_index ON mtc_admin.[check] (checkForm_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_check_checkStatus_id ON mtc_admin.[check] (checkStatus_id) WITH (DROP_EXISTING = ON)
-- not recommended due to highly active table
DROP INDEX IF EXISTS [mtc_admin].[check].[check_receivedByServerAt_index];
DROP INDEX IF EXISTS [mtc_admin].[check].[check_liveFlag_pupilId_index];
DROP INDEX IF EXISTS [mtc_admin].[check].[check_checkWindow_id_index];
-- heavily used lookup
CREATE INDEX [IX_check_pupil_id] ON [mtc-load].[mtc_admin].[check] ([pupil_id]) INCLUDE ([checkForm_id]) WITH (DROP_EXISTING = ON)

-- check config
CREATE INDEX idx_checkConfig_check_id ON mtc_admin.[checkConfig] (check_id) WITH (DROP_EXISTING = ON)

-- checkPin
CREATE INDEX idx_checkPin_pin_id ON mtc_admin.[checkPin] (pin_id) WITH (DROP_EXISTING = ON)

-- group
CREATE INDEX idx_group_school_id ON mtc_admin.[group] (school_id) WITH (DROP_EXISTING = ON)

-- pupil
CREATE NONCLUSTERED INDEX [idx_azure_recommended_pupil_group] ON [mtc_admin].[pupil] ([group_id]) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_azure_recommended_pupil_school
ON [mtc_admin].[pupil] (school_id) INCLUDE (attendanceId, checkComplete, createdAt, currentCheckId, dateOfBirth,
                                foreName, foreNameAlias, gender, group_id, isTestAccount,
                                lastName, lastNameAlias, middleNames,
                                pupilAgeReason_id, upn, urlSlug)  WITH (DROP_EXISTING = ON);
CREATE INDEX idx_pupil_currentCheckId ON [mtc_admin].pupil (currentCheckId) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupil_attendanceId ON [mtc_admin].pupil (attendanceId) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupil_schoolId ON [mtc_admin].pupil (school_id) WITH (DROP_EXISTING = ON)
DROP INDEX IF EXISTS [mtc_admin].[pupil].[pupil_job_id_index];
DROP INDEX IF EXISTS [mtc_admin].[pupil].[idx_azure_recommended_pupil_school];
DROP INDEX IF EXISTS IX_pupil_pupilAgeReason_id ON mtc_admin.pupil;

-- pupil access arrangements
CREATE INDEX idx_pupilAccessArrangements_questionReaderReasons_id ON mtc_admin.[pupilAccessArrangements] (questionReaderReasons_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupilAccessArrangements_pupil_id ON mtc_admin.[pupilAccessArrangements] (pupil_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupilAccessArrangements_recordedBy_user_id ON mtc_admin.[pupilAccessArrangements] (recordedBy_user_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupilAccessArrangements_accessArrangements_id ON mtc_admin.[pupilAccessArrangements] (accessArrangements_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupilAccessArrangements_pupilFontSizes_id ON mtc_admin.[pupilAccessArrangements] (pupilFontSizes_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupilAccessArrangements_pupilColourContrasts_id ON mtc_admin.[pupilAccessArrangements] (pupilColourContrasts_id) WITH (DROP_EXISTING = ON)

-- pupil attendance
CREATE INDEX idx_pupilAttendance_attendanceCode_id ON mtc_admin.[pupilAttendance] (attendanceCode_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupilAttendance_pupil_id ON mtc_admin.[pupilAttendance] (pupil_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupilAttendance_user_id ON mtc_admin.[pupilAttendance] (recordedBy_user_id) WITH (DROP_EXISTING = ON)

-- pupil restart
CREATE INDEX idx_pupilRestart_pupil_id ON mtc_admin.[pupilRestart] (pupil_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupilRestart_recordedBy_user_id ON mtc_admin.[pupilRestart] (recordedByUser_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupilRestart_deletedByUser_id ON mtc_admin.[pupilRestart] (deletedByUser_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupilRestart_pupilRestartReason_id ON mtc_admin.[pupilRestart] (pupilRestartReason_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupilRestart_check_id ON mtc_admin.[pupilRestart] (check_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_pupilRestart_originCheck_id ON mtc_admin.[pupilRestart] (originCheck_id) WITH (DROP_EXISTING = ON)

-- sce schools
CREATE INDEX idx_sce_school_id ON mtc_admin.[sce] (school_id) WITH (DROP_EXISTING = ON)

-- school score
CREATE INDEX idx_schoolScore_school_id ON mtc_admin.[schoolScore] (school_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_schoolScore_checkWindow_id ON mtc_admin.[schoolScore] (checkWindow_id) WITH (DROP_EXISTING = ON)

-- user
CREATE INDEX idx_user_role_id ON mtc_admin.[user] (role_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_user_school_id ON mtc_admin.[user] (school_id) WITH (DROP_EXISTING = ON)
