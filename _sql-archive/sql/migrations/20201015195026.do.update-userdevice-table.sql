IF NOT EXISTS(
        SELECT *
          FROM sys.columns
         WHERE object_ID = object_id('mtc_results.userDevice')
           AND col_name(object_ID, column_Id) = 'ident')
    BEGIN
        ALTER TABLE [mtc_results].[userDevice]
            ADD [ident] NVARCHAR(100);
    END


EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'The ident identifies a particular browser on a single machine by use of a cookie.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'ident';
