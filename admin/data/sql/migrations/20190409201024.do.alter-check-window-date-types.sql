DECLARE @columnName VARCHAR(max)
DECLARE @sql NVARCHAR(max)

DECLARE cur CURSOR FOR
 SELECT COLUMN_NAME
   FROM INFORMATION_SCHEMA.COLUMNS
  WHERE COLUMN_NAME LIKE '%Date'
    AND TABLE_NAME = 'checkWindow'

OPEN cur

FETCH NEXT FROM cur INTO @columnName;

WHILE @@fetch_status = 0
BEGIN
    SET @sql = '
    DECLARE @ObjectName NVARCHAR(100)
    SELECT @ObjectName = OBJECT_NAME([default_object_id]) FROM SYS.COLUMNS
    WHERE [object_id] = OBJECT_ID(''[mtc_admin].[checkWindow]'') AND [name] = ' + QUOTENAME(@columnName,'''') + '
    EXEC(''ALTER TABLE [mtc_admin].[checkWindow] DROP CONSTRAINT '' + @ObjectName)
    ALTER TABLE [mtc_admin].checkWindow ALTER COLUMN ' + @columnName + ' DATETIME2 NOT NULL
    ALTER TABLE [mtc_admin].checkWindow ADD DEFAULT GETUTCDATE() FOR ' + @columnName + '
    '
    EXEC(@sql)

   FETCH NEXT FROM cur INTO @columnName;
END

CLOSE cur
DEALLOCATE cur
