IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.hdf')
                 AND col_name(object_ID, column_Id) = 'confirmed')
    BEGIN
        ALTER TABLE [mtc_admin].[hdf]
            ADD [confirmed] bit NOT NULL DEFAULT 0;
    END
