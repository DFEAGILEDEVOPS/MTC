DECLARE @tableName VARCHAR(max)
DECLARE @sql NVARCHAR(max)

DECLARE cur CURSOR FOR SELECT t.name
                         FROM sys.schemas s
                              JOIN sys.tables t ON s.schema_id = t.schema_id
                              JOIN sys.columns c ON t.object_id = c.object_id
                        WHERE c.name = 'updatedAt'
                          AND s.name = 'mtc_results';

OPEN cur

FETCH NEXT FROM cur INTO @tableName;

WHILE @@fetch_status = 0 BEGIN
    SET @sql = '
    CREATE OR ALTER TRIGGER [mtc_results].[' + @tableName + 'UpdatedAtTrigger]
    ON [mtc_results].[' + @tableName + ']
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_results].[' + @tableName + ']
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [' + @tableName + '].id = inserted.id
    END
    '

    EXEC (@sql)

    FETCH NEXT FROM cur INTO @tableName;
END

CLOSE cur
DEALLOCATE cur
