IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_reports.psychometricReport')
                 AND col_name(object_ID, column_Id) = 'ImportedFromCensus')
    BEGIN
        ALTER TABLE [mtc_results].[psychometricReport]
            ADD [ImportedFromCensus] BIT NOT NULL
            CONSTRAINT [DF_ImportedFromCensus] DEFAULT 0;
    END
