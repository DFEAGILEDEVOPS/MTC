IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_results.psychometricReport')
                 AND col_name(object_ID, column_Id) = 'ToECode')
    BEGIN
        ALTER TABLE [mtc_results].[psychometricReport]
            ADD [ToECode] INT;
    END
