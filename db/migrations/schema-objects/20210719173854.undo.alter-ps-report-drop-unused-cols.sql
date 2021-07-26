IF NOT EXISTS(SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_results.psychometricReport')
                 AND col_name(object_ID, column_Id) = 'DeviceType')
    BEGIN
        ALTER TABLE [mtc_results].[psychometricReport]
            ADD [DeviceType] NVARCHAR(128);
    END

IF NOT EXISTS(SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_results.psychometricReport')
                 AND col_name(object_ID, column_Id) = 'DeviceTypeModel')
    BEGIN
        ALTER TABLE [mtc_results].[psychometricReport]
            ADD [DeviceTypeModel] NVARCHAR(128);
    END
