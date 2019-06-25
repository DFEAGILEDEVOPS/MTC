-- delete duplicates from the table

IF EXISTS(SELECT 1
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = 'mtc_admin'
            AND TABLE_NAME = 'checkResultDuplicates')
    BEGIN
        DELETE
        FROM [mtc_admin].[checkResult]
        WHERE id IN (
            SELECT id
            from [mtc_admin].[checkResultDuplicates]
        )
    END
