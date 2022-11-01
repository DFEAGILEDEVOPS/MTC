-- Add new school_id column
IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.adminLogonEvent')
                 AND col_name(object_ID, column_Id) = 'school_id')
    BEGIN
        ALTER TABLE [mtc_admin].[adminLogonEvent]
            ADD [school_id] INT;
    END

go

-- make it a foreign key
IF NOT EXISTS(SELECT *
                FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
               WHERE CONSTRAINT_COLUMN_USAGE.TABLE_SCHEMA = 'mtc_admin'
                 AND CONSTRAINT_COLUMN_USAGE.TABLE_NAME = 'adminLogonEvent'
                 AND CONSTRAINT_COLUMN_USAGE.COLUMN_NAME = 'school_id'
                 AND CONSTRAINT_NAME = 'FK_adminLogonEvent_school_id')
    BEGIN
        ALTER TABLE [mtc_admin].[adminLogonEvent]
            ADD CONSTRAINT [FK_adminLogonEvent_school_id]
                FOREIGN KEY (school_id) REFERENCES [mtc_admin].[school] (id);
    END

-- add an index
DROP INDEX IF EXISTS [mtc_admin].[adminLogonEvent].[IX_adminLogonEvent_school_id];
CREATE INDEX IX_adminLogonEvent_school_id ON mtc_admin.adminLogonEvent([school_id]);
