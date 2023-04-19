IF EXISTS(SELECT *
            FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
           WHERE CONSTRAINT_COLUMN_USAGE.TABLE_SCHEMA = 'mtc_admin'
             AND CONSTRAINT_COLUMN_USAGE.TABLE_NAME = 'hdf'
             AND CONSTRAINT_COLUMN_USAGE.COLUMN_NAME = 'hdfStatus_id'
             AND CONSTRAINT_NAME = 'FK_hdf_hdfStatus_id')
    BEGIN
        ALTER TABLE [mtc_admin].[hdf]
            DROP CONSTRAINT [FK_hdf_hdfStatus_id];
    END

ALTER TABLE [mtc_admin].[hdf] DROP COLUMN IF EXISTS [hdfStatus_id]
