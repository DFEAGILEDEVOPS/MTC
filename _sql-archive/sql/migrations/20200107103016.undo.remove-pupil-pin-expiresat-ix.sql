CREATE INDEX idx_azure_recommended_pupil_school
    ON [mtc_admin].[pupil] (school_id) INCLUDE (createdAt, dateOfBirth, foreName, gender, isTestAccount, job_id,
                                                jwtSecret, jwtToken, lastName, middleNames, foreNameAlias, lastNameAlias,
                                                pin, pinExpiresAt, pupilAgeReason_id, pupilStatus_id, updatedAt, upn,
                                                urlSlug, version)
;

CREATE UNIQUE INDEX pupil_school_id_pin_uindex
    ON [mtc_admin].[pupil] (school_id, pin)
    WHERE [pin] IS NOT NULL
;


