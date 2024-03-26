 IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.pupilRestart')
                 AND col_name(object_ID, column_Id) = 'didNotCompleteInformation')
    BEGIN
         ALTER TABLE [mtc_admin].[pupilRestart] ADD [didNotCompleteInformation] NVARCHAR(100) NULL;
    END

 IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.pupilRestart')
                 AND col_name(object_ID, column_Id) = 'didNotCompleteInformation')
    BEGIN
         ALTER TABLE [mtc_admin].[pupilRestart] ADD [furtherInformation] NVARCHAR(1000) NULL;
    END
