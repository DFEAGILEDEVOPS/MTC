IF EXISTS(SELECT *
            FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
           WHERE CONSTRAINT_COLUMN_USAGE.TABLE_SCHEMA = 'mtc_admin'
             AND CONSTRAINT_COLUMN_USAGE.TABLE_NAME = 'school'
             AND CONSTRAINT_COLUMN_USAGE.COLUMN_NAME = 'typeOfEstablishmentLookup_id'
             AND CONSTRAINT_NAME = 'FK_typeOfEstablishmentLookup_id')
    BEGIN
        ALTER TABLE [mtc_admin].[school]
            DROP CONSTRAINT [FK_typeOfEstablishmentLookup_id];
    END


GO

ALTER TABLE [mtc_admin].[school] DROP COLUMN IF EXISTS  [typeOfEstablishmentLookup_id];
