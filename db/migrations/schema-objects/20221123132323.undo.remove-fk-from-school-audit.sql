IF NOT EXISTS(SELECT *
                FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
               WHERE CONSTRAINT_COLUMN_USAGE.TABLE_SCHEMA = 'mtc_admin'
                 AND CONSTRAINT_COLUMN_USAGE.TABLE_NAME = 'schoolAudit'
                 AND CONSTRAINT_COLUMN_USAGE.COLUMN_NAME = 'school_id'
                 AND CONSTRAINT_NAME = 'FK_school_id')
    BEGIN
        ALTER TABLE [mtc_admin].[schoolAudit]
            ADD CONSTRAINT [FK_school_id]
                FOREIGN KEY (school_id) REFERENCES [mtc_admin].[school] (id);
    END
