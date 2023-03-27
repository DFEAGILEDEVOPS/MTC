IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.hdf')
                 AND col_name(object_ID, column_Id) = 'hdfStatus_id')
    BEGIN
        ALTER TABLE [mtc_admin].[hdf]
            ADD [hdfStatus_id] int NOT NULL;
    END

IF NOT EXISTS(SELECT *
                FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
               WHERE CONSTRAINT_COLUMN_USAGE.TABLE_SCHEMA = 'mtc_admin'
                 AND CONSTRAINT_COLUMN_USAGE.TABLE_NAME = 'hdf'
                 AND CONSTRAINT_COLUMN_USAGE.COLUMN_NAME = 'hdfStatus_id'
                 AND CONSTRAINT_NAME = 'FK_hdf_hdfStatus_id')
    BEGIN
        ALTER TABLE [mtc_admin].[hdf]
            ADD CONSTRAINT [FK_hdf_hdfStatus_id]
                FOREIGN KEY (hdfStatus_id) REFERENCES [mtc_admin].[hdfStatusLookup] (id);
    END
