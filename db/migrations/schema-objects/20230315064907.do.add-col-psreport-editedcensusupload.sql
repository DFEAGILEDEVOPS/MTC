IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.pupil')
                 AND col_name(object_ID, column_Id) = 'isEdited')
    BEGIN
        ALTER TABLE [mtc_admin].[pupil]
            ADD [isEdited] BIT NOT NULL
            CONSTRAINT [DF_isEdited] DEFAULT 0;
    END
