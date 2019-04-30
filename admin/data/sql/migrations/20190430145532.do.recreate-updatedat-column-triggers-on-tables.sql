DECLARE @tableName VARCHAR(max)
DECLARE @sql NVARCHAR(max)

DECLARE cur CURSOR FOR
    SELECT t.name
    FROM SYS.COLUMNS c
    JOIN SYS.TABLES t
        ON c.OBJECT_ID = t.OBJECT_ID
    WHERE c.name LIKE '%updatedAt%'

OPEN cur

FETCH NEXT FROM cur INTO @tableName;

WHILE @@fetch_status = 0
BEGIN
    SET @sql = '
    CREATE TRIGGER [mtc_admin].[' + @tableName + 'UpdatedAtTrigger]
    ON [mtc_admin].[' + @tableName + ']
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[' + @tableName + ']
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [' + @tableName + '].id = inserted.id
    END
    '

    EXEC(@sql)

    FETCH NEXT FROM cur INTO @tableName;
END

CLOSE cur
DEALLOCATE cur
