IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.job')
                 AND col_name(object_ID, column_Id) = 'meta')
    BEGIN
        ALTER TABLE [mtc_admin].[job]
            ADD [meta] nvarchar(128);


        EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'For system use', @level0type = N'Schema',
             @level0name = 'mtc_admin', @level1type = N'Table', @level1name = 'job', @level2type = N'Column',
             @level2name = 'meta';
    END
