IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupil]') AND NAME ='idx_azure_recommended_pupil_group')
BEGIN
    DROP INDEX idx_azure_recommended_pupil_group ON mtc_admin.[pupil];
END
CREATE INDEX [idx_azure_recommended_pupil_group] ON [mtc_admin].[pupil] ([group_id])


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupil]') AND NAME ='idx_azure_recommended_pupil_school')
BEGIN
    DROP INDEX idx_azure_recommended_pupil_school ON mtc_admin.[pupil];
END
CREATE INDEX idx_azure_recommended_pupil_school
ON [mtc_admin].[pupil] (school_id) INCLUDE (attendanceId, checkComplete, createdAt, currentCheckId, dateOfBirth,
                                foreName, foreNameAlias, gender, group_id, isTestAccount,
                                lastName, lastNameAlias, middleNames,
                                pupilAgeReason_id, upn, urlSlug);


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupil]') AND NAME ='idx_pupil_currentCheckId')
BEGIN
    DROP INDEX idx_pupil_currentCheckId ON mtc_admin.[pupil];
END
CREATE INDEX idx_pupil_currentCheckId ON [mtc_admin].pupil (currentCheckId)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupil]') AND NAME ='idx_pupil_attendanceId')
BEGIN
    DROP INDEX idx_pupil_attendanceId ON mtc_admin.[pupil];
END
CREATE INDEX idx_pupil_attendanceId ON [mtc_admin].pupil (attendanceId)


DROP INDEX IF EXISTS [mtc_admin].[pupil].[pupil_job_id_index];
