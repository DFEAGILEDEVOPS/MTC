DROP INDEX IF EXISTS mtc_admin.pupil.pupil_school_id_index;
GO

ALTER TABLE mtc_admin.pupil
    ALTER COLUMN checkComplete BIT NOT NULL;
GO

CREATE INDEX pupil_school_id_index ON mtc_admin.pupil (school_id) include (currentCheckId, attendanceId, checkComplete,
                                                                           group_id, restartAvailable, upn, urlSlug,
                                                                           foreName, middleNames, lastName, dateOfBirth,
                                                                           foreNameAlias, lastNameAlias);
