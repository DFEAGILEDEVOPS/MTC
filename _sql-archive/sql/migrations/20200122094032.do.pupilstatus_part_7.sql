-- Delete the table content
IF EXISTS(SELECT *
            FROM INFORMATION_SCHEMA.TABLES
           WHERE TABLE_NAME = 'pupilStatus'
             AND TABLE_SCHEMA = 'mtc_admin')
    DELETE FROM [mtc_admin].[pupilStatus];
