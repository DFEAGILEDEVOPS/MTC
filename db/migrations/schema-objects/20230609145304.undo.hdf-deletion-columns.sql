IF EXISTS(SELECT *
            FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
           WHERE CONSTRAINT_COLUMN_USAGE.TABLE_SCHEMA = 'mtc_admin'
             AND CONSTRAINT_COLUMN_USAGE.TABLE_NAME = 'hdf'
             AND CONSTRAINT_COLUMN_USAGE.COLUMN_NAME = 'deletedBy_userId'
             AND CONSTRAINT_NAME = 'FK_hdf_deletedBy_user_id')
    BEGIN
        ALTER TABLE [mtc_admin].[hdf]
            DROP CONSTRAINT [FK_hdf_deletedBy_user_id];
    END

IF EXISTS(SELECT *
          FROM sys.objects so
          where so.name = 'DEFAULT_hdf_isDeleted')
    BEGIN
        ALTER TABLE [mtc_admin].[hdf]
            DROP CONSTRAINT [DEFAULT_hdf_isDeleted];
    END

ALTER TABLE [mtc_admin].[hdf] DROP COLUMN IF EXISTS [isDeleted], COLUMN IF EXISTS [deletedAt], COLUMN IF EXISTS [deletedBy_userId];
