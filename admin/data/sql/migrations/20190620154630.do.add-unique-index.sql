-- Add the unique index if it does not exist
IF NOT EXISTS(
        SELECT *
        FROM sys.indexes i
        WHERE name = 'checkResult_check_id_uindex'
          AND i.object_ID = object_id('mtc_admin.checkResult')
    )
    BEGIN
        ALTER TABLE [mtc_admin].[checkResult]
            ADD CONSTRAINT [checkResult_check_id_uindex] UNIQUE (check_id);
    END
