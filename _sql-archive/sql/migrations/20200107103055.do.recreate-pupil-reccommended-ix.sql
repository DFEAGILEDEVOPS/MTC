CREATE INDEX idx_azure_recommended_pupil_school
    ON [mtc_admin].[pupil] (school_id) INCLUDE (attendanceId, checkComplete, createdAt, currentCheckId, dateOfBirth,
                                                foreName, foreNameAlias, gender, group_id, isTestAccount, job_id,
                                                jwtSecret, jwtToken, lastName, lastNameAlias, middleNames,
                                                pupilAgeReason_id, pupilStatus_id, updatedAt, upn, urlSlug, version)
;