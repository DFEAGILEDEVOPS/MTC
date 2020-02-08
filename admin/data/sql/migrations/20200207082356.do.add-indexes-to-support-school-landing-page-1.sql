IF EXISTS(SELECT *
            FROM sys.indexes
           WHERE object_id = object_id('mtc_admin.pupil')
             AND NAME = 'pupil_school_id_index')
    BEGIN
        DROP INDEX pupil_school_id_index ON mtc_admin.pupil;
    END
CREATE INDEX pupil_school_id_index ON mtc_admin.pupil (school_id) INCLUDE (currentCheckId, attendanceId,
                                                                           checkComplete, group_id,
                                                                           restartAvailable, upn,
                                                                           urlSlug);
