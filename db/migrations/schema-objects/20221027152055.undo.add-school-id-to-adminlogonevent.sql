-- drop foreign key
IF EXISTS(SELECT *
            FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
           WHERE CONSTRAINT_COLUMN_USAGE.TABLE_SCHEMA = 'mtc_admin'
             AND CONSTRAINT_COLUMN_USAGE.TABLE_NAME = 'adminLogonEvent'
             AND CONSTRAINT_COLUMN_USAGE.COLUMN_NAME = 'school_id'
             AND CONSTRAINT_NAME = 'FK_adminLogonEvent_school_id')
    BEGIN
        ALTER TABLE [mtc_admin].[adminLogonEvent]
            DROP CONSTRAINT [FK_adminLogonEvent_school_id];
    END

-- drop column
ALTER TABLE [mtc_admin].[adminLogonEvent] DROP COLUMN IF EXISTS  [school_id];
