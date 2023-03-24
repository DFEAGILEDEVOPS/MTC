IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('[mtc_admin].[hdf]')
                 AND col_name(object_ID, column_Id) = 'noPupilsFurtherInfo')
    BEGIN
        ALTER TABLE [mtc_admin].[hdf]
            ADD [noPupilsFurtherInfo] NVARCHAR(MAX) NULL;
    END
`
