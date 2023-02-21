IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.pupilAgeReason')
                 AND col_name(object_ID, column_Id) = 'lastUpdatedBy_userId')
    BEGIN
        ALTER TABLE [mtc_admin].[pupilAgeReason]
            ADD [lastUpdatedBy_userId] INT NOT NULL;
    END
