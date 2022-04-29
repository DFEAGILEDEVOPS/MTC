IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.attendanceCode')
                 AND col_name(object_ID, column_Id) = 'isPrivileged')
    BEGIN
        ALTER TABLE [mtc_admin].[attendanceCode]
            ADD [isPrivileged] Bit,
              CONSTRAINT [DF_isPrivileged]
              DEFAULT 0 FOR [isPrivileged];
    END
