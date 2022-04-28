IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.attendanceCode')
                 AND col_name(object_ID, column_Id) = 'role_id')
    BEGIN
        ALTER TABLE [mtc_admin].[attendanceCode]
            ADD [role_id] Int;
    END
