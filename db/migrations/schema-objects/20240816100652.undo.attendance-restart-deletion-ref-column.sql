 IF EXISTS(SELECT *
            FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
           WHERE CONSTRAINT_COLUMN_USAGE.TABLE_SCHEMA = 'mtc_admin'
             AND CONSTRAINT_COLUMN_USAGE.TABLE_NAME = 'pupilRestart'
             AND CONSTRAINT_COLUMN_USAGE.COLUMN_NAME = 'deletedBy_pupilAttendance_id'
             AND CONSTRAINT_NAME = 'FK_pupilRestart_pupilAttendance_deletedBy_id')
    BEGIN
        ALTER TABLE [mtc_admin].[pupilRestart]
            DROP CONSTRAINT [FK_pupilRestart_pupilAttendance_deletedBy_id];
    END;

 ALTER TABLE [mtc_admin].[pupilRestart] DROP COLUMN IF EXISTS  [deletedBy_pupilAttendance_id];
