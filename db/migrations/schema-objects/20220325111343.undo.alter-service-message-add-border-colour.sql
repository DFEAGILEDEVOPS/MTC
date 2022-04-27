IF EXISTS(SELECT *
            FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
           WHERE CONSTRAINT_COLUMN_USAGE.TABLE_SCHEMA = 'mtc_admin'
             AND CONSTRAINT_COLUMN_USAGE.TABLE_NAME = 'serviceMessage'
             AND CONSTRAINT_COLUMN_USAGE.COLUMN_NAME = 'borderColourLookupId'
             AND CONSTRAINT_NAME = 'FK_serviceMessage_borderColourLookupId_serviceMessageBorderColourLookup_id')
    BEGIN
        ALTER TABLE [mtc_admin].[serviceMessage]
            DROP CONSTRAINT [FK_serviceMessage_borderColourLookupId_serviceMessageBorderColourLookup_id];
    END
GO

ALTER TABLE [mtc_admin].[serviceMessage] DROP COLUMN IF EXISTS  [borderColourLookupId];
GO

DROP TABLE IF EXISTS mtc_admin.serviceMessageBorderColourLookup;
