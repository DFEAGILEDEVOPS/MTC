IF NOT EXISTS(SELECT *
                FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
               WHERE CONSTRAINT_COLUMN_USAGE.TABLE_SCHEMA = 'mtc_admin'
                 AND CONSTRAINT_COLUMN_USAGE.TABLE_NAME = 'pupil'
                 AND CONSTRAINT_COLUMN_USAGE.COLUMN_NAME = 'pupilStatus_id'
                 AND CONSTRAINT_NAME = 'FK_pupil_pupilStatus_id_pupilStatus_id')
    BEGIN
        ALTER TABLE [mtc_admin].[pupil]
            ADD CONSTRAINT [FK_pupil_pupilStatus_id_pupilStatus_id]
                FOREIGN KEY (pupilStatus_id) REFERENCES [mtc_admin].[pupilStatus] (id);
    END
