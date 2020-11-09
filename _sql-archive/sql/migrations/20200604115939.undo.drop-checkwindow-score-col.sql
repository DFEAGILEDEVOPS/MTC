IF NOT EXISTS(SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.checkWindow')
                 AND col_name(object_ID, column_Id) = 'score')
    BEGIN
        ALTER TABLE [mtc_admin].[checkWindow]
            ADD [score] decimal(8, 2);
    END
