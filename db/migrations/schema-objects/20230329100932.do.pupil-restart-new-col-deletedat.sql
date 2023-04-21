IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.pupilRestart')
                 AND col_name(object_ID, column_Id) = 'deletedAt')
    BEGIN
        ALTER TABLE [mtc_admin].[pupilRestart]
            ADD [deletedAt] DATETIMEOFFSET(3);
    END
