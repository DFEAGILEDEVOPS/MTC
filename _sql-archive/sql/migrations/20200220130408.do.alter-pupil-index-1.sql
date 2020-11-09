DROP INDEX IF EXISTS mtc_admin.pupil.pupil_school_id_index;

-- Recreate index with more leaf nodes
CREATE INDEX pupil_school_id_index ON mtc_admin.pupil (school_id) INCLUDE (currentCheckId, attendanceId, checkComplete,
                                                                           group_id, restartAvailable, upn,
                                                                           urlSlug, foreName, middleNames, lastName,
                                                                           dateOfBirth, foreNameAlias, lastNameAlias);
