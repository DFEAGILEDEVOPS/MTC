IF NOT EXISTS(SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('[mtc_admin].[hdf]')
                 AND col_name(object_ID, column_Id) = 'isDeleted')
  BEGIN
  ALTER TABLE [mtc_admin].[hdf]
      ADD [isDeleted] BIT CONSTRAINT [DEFAULT_hdf_isDeleted] DEFAULT 0 NOT NULL;
  END

IF NOT EXISTS(SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('[mtc_admin].[hdf]')
                 AND col_name(object_ID, column_Id) = 'deletedAt')
  BEGIN
  ALTER TABLE [mtc_admin].[hdf]
      ADD [deletedAt] DATETIME2 (3) NULL;
  END

IF NOT EXISTS(SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('[mtc_admin].[hdf]')
                 AND col_name(object_ID, column_Id) = 'deletedBy_userId')
  BEGIN
  ALTER TABLE [mtc_admin].[hdf]
      ADD [deletedBy_userId] INT NULL;
  END

IF NOT EXISTS(SELECT *
                FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
               WHERE CONSTRAINT_COLUMN_USAGE.TABLE_SCHEMA = 'mtc_admin'
                 AND CONSTRAINT_COLUMN_USAGE.TABLE_NAME = 'hdf'
                 AND CONSTRAINT_COLUMN_USAGE.COLUMN_NAME = 'deletedBy_userId'
                 AND CONSTRAINT_NAME = 'FK_hdf_deletedBy_user_id')
    BEGIN
        ALTER TABLE [mtc_admin].[hdf] WITH NOCHECK
    ADD CONSTRAINT [FK_hdf_deletedBy_user_id] FOREIGN KEY ([deletedBy_userId]) REFERENCES [mtc_admin].[user] ([id]);
    END


