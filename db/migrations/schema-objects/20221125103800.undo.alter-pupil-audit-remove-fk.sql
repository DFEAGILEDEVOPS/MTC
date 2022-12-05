IF NOT EXISTS(SELECT *
                FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
               WHERE CONSTRAINT_COLUMN_USAGE.TABLE_SCHEMA = 'mtc_admin'
                 AND CONSTRAINT_COLUMN_USAGE.TABLE_NAME = 'pupilAudit'
                 AND CONSTRAINT_COLUMN_USAGE.COLUMN_NAME = 'pupil_id'
                 AND CONSTRAINT_NAME = 'FK_pupilAudit_pupil_id')
    BEGIN
        ALTER TABLE [mtc_admin].[pupilAudit]
            ADD CONSTRAINT [FK_pupilAudit_pupil_id]
                FOREIGN KEY (pupil_id) REFERENCES [mtc_admin].[pupil] (id);
    END
