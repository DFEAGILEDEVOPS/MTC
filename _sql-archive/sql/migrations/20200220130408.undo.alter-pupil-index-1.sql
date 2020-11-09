DROP INDEX IF EXISTS mtc_admin.pupil.pupil_school_id_index;

-- Restore original index
CREATE INDEX pupil_school_id_index ON mtc_admin.pupil (school_id) INCLUDE (currentCheckId, attendanceId, checkComplete,
                                                                           group_id, restartAvailable, upn, urlSlug);
