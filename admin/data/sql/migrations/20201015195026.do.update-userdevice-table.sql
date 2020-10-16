IF NOT EXISTS(
        SELECT *
          FROM sys.columns
         WHERE object_ID = object_id('mtc_results.userDevice')
           AND col_name(object_ID, column_Id) = 'ident')
    BEGIN
        ALTER TABLE [mtc_results].[userDevice]
            ADD [ident] NVARCHAR(100);
    END
