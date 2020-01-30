
-- sql azure recommended...
CREATE NONCLUSTERED INDEX [idx_azure_recommended_pupil_group] ON [mtc_admin].[pupil] ([group_id]) WITH (ONLINE = ON)

--
IF NOT EXISTS (SELECT * FROM sys.indexes i
               WHERE i.object_ID=object_id('mtc_admin.pupil')
               AND name ='idx_azure_recommended_pupil_school')
    BEGIN
        --then the index doesn’t exist
        CREATE INDEX idx_azure_recommended_pupil_school
        ON [mtc_admin].[pupil] (school_id) INCLUDE (attendanceId, checkComplete, createdAt, currentCheckId, dateOfBirth,
                                        foreName, foreNameAlias, gender, group_id, isTestAccount,
                                        lastName, lastNameAlias, middleNames,
                                        pupilAgeReason_id, upn, urlSlug)
        ;
    END;


-- jon suggestion
CREATE INDEX idx_check_received_live_complete ON mtc_admin.[check] (isLiveCheck, received, complete)
CREATE INDEX idx_check_received_live_failed	ON mtc_admin.[check] (isLiveCheck, received, processingFailed)

-- FKs
CREATE INDEX check_pupil_id_index ON mtc_admin.[check] (pupil_id)
CREATE INDEX check_checkForm_id_index ON mtc_admin.[check] (checkForm_id)
CREATE INDEX idx_check_checkStatus_id ON mtc_admin.[check] (checkStatus_id)
CREATE INDEX idx_checkPin_pin_id ON mtc_admin.[checkPin] (pin_id)
CREATE INDEX check_checkWindow_id_index ON mtc_admin.[check] (checkWindow_id)
CREATE INDEX idx_checkConfig_check_id ON mtc_admin.[checkConfig] (check_id)
CREATE INDEX idx_group_school_id ON mtc_admin.[group] (school_id)
CREATE INDEX idx_pupil_currentCheckId ON [mtc_admin].pupil (currentCheckId)
CREATE INDEX idx_pupil_attendanceId ON [mtc_admin].pupil (attendanceId)
CREATE INDEX idx_pupil_schoolId ON [mtc_admin].pupil (school_id)
CREATE INDEX idx_pupilAccessArrangements_questionReaderReasons_id ON mtc_admin.[pupilAccessArrangements] (questionReaderReasons_id)
CREATE INDEX idx_pupilAccessArrangements_pupil_id ON mtc_admin.[pupilAccessArrangements] (pupil_id)
CREATE INDEX idx_pupilAccessArrangements_recordedBy_user_id ON mtc_admin.[pupilAccessArrangements] (recordedBy_user_id)
CREATE INDEX idx_pupilAccessArrangements_accessArrangements_id ON mtc_admin.[pupilAccessArrangements] (accessArrangements_id)
CREATE INDEX idx_pupilAccessArrangements_pupilFontSizes_id ON mtc_admin.[pupilAccessArrangements] (pupilFontSizes_id)
CREATE INDEX idx_pupilAccessArrangements_pupilColourContrasts_id ON mtc_admin.[pupilAccessArrangements] (pupilColourContrasts_id)
CREATE INDEX idx_pupilAttendance_attendanceCode_id ON mtc_admin.[pupilAttendance] (attendanceCode_id)
CREATE INDEX idx_pupilAttendance_pupil_id ON mtc_admin.[pupilAttendance] (pupil_id)
CREATE INDEX idx_pupilAttendance_user_id ON mtc_admin.[pupilAttendance] (recordedBy_user_id)
CREATE INDEX idx_pupilRestart_pupil_id ON mtc_admin.[pupilRestart] (pupil_id)
CREATE INDEX idx_pupilRestart_recordedBy_user_id ON mtc_admin.[pupilRestart] (recordedByUser_id)
CREATE INDEX idx_pupilRestart_deletedByUser_id ON mtc_admin.[pupilRestart] (deletedByUser_id)
CREATE INDEX idx_pupilRestart_pupilRestartReason_id ON mtc_admin.[pupilRestart] (pupilRestartReason_id)
CREATE INDEX idx_pupilRestart_check_id ON mtc_admin.[pupilRestart] (check_id)
CREATE INDEX idx_pupilRestart_originCheck_id ON mtc_admin.[pupilRestart] (originCheck_id)
CREATE INDEX idx_sce_school_id ON mtc_admin.[sce] (school_id)
CREATE INDEX idx_schoolScore_school_id ON mtc_admin.[schoolScore] (school_id)
CREATE INDEX idx_schoolScore_checkWindow_id ON mtc_admin.[schoolScore] (checkWindow_id)
CREATE INDEX idx_user_role_id ON mtc_admin.[user] (role_id)
CREATE INDEX idx_user_school_id ON mtc_admin.[user] (school_id)

-- IDEAS

/*
for vewPupilsWithActiveLivePins...
cp.pinExpiresAt
chkStatus.code
chk.isLiveCheck
p.attendanceId
*/





