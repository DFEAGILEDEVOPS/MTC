IF NOT EXISTS(SELECT *
                FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
               WHERE CONSTRAINT_COLUMN_USAGE.TABLE_SCHEMA = 'mtc_admin'
                 AND CONSTRAINT_COLUMN_USAGE.TABLE_NAME = 'pupilAgeReadon'
                 AND CONSTRAINT_COLUMN_USAGE.COLUMN_NAME = 'lastUpdatedBy_userId'
                 AND CONSTRAINT_NAME = 'FK_pupilAgeReason_lastUpdatedBy_userId_user_id')
    BEGIN
        ALTER TABLE [mtc_admin].[pupilAgeReason]
            ADD CONSTRAINT [FK_pupilAgeReason_lastUpdatedBy_userId_user_id]
                FOREIGN KEY (lastUpdatedBy_userId) REFERENCES [mtc_admin].[user] (id);
    END
