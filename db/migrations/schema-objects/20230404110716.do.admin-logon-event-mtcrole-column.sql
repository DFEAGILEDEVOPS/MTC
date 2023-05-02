IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.adminLogonEvent')
                 AND col_name(object_ID, column_Id) = 'mtcRole')
    BEGIN
        ALTER TABLE [mtc_admin].[adminLogonEvent]
            ADD [mtcRole] nvarchar(50) NULL;
    END
