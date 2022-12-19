-- add a new column to the school table
IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.school')
                 AND col_name(object_ID, column_Id) = 'isTestSchool')
    BEGIN
        ALTER TABLE [mtc_admin].[school]
            ADD [isTestSchool] BIT
            CONSTRAINT [DF_isTestSchool] DEFAULT 0 NOT NULL;
    END
