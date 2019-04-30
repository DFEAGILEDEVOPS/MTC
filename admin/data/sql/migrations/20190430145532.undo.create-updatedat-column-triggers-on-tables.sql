DECLARE @tableName VARCHAR(max)
DECLARE @sql NVARCHAR(max)

DECLARE cur CURSOR FOR
    SELECT t.name
    FROM SYS.COLUMNS c
    JOIN SYS.TABLES t
        ON c.OBJECT_ID = t.OBJECT_ID
    WHERE c.name = 'updatedAt'

OPEN cur

FETCH NEXT FROM cur INTO @tableName;

WHILE @@fetch_status = 0
BEGIN
    SET @sql = 'DROP TRIGGER [mtc_admin].[' + @tableName + 'UpdatedAtTrigger]'

    EXEC(@sql)

    FETCH NEXT FROM cur INTO @tableName;
END

CLOSE cur
DEALLOCATE cur
