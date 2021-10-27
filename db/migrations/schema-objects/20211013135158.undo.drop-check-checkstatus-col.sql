IF NOT EXISTS(
        SELECT *
          FROM sys.columns
         WHERE object_ID = object_id('mtc_admin.check')
           AND col_name(object_ID, column_Id) = 'checkStatus_id')
    BEGIN
        ALTER TABLE [mtc_admin].[check]
            ADD [checkStatus_id] INT NOT NULL;
    END
