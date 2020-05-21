IF NOT EXISTS(SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.check')
                 AND col_name(object_ID, column_Id) = 'mark')
    BEGIN
        ALTER TABLE [mtc_admin].[check] ADD mark TINYINT
    END

IF NOT EXISTS(SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.check')
                 AND col_name(object_ID, column_Id) = 'mark')
    BEGIN
        ALTER TABLE [mtc_admin].[check] ADD maxMark TINYINT
    END

IF NOT EXISTS(SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.check')
                 AND col_name(object_ID, column_Id) = 'mark')
    BEGIN
        ALTER TABLE [mtc_admin].[check] ADD markedAt DATETIMEOFFSET(3);
    END
