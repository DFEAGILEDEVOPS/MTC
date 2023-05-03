IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.attendanceCode')
                 AND col_name(object_ID, column_Id) = 'visible')
    BEGIN
        ALTER TABLE [mtc_admin].[attendanceCode]
            ADD [visible] bit NOT NULL CONSTRAINT DF_attendanceCode_visible_default DEFAULT 1;
    END
