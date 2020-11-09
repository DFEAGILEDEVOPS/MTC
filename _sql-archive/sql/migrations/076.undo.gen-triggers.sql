DECLARE @function NVARCHAR(255)
DECLARE @sql NVARCHAR(MAX)

DECLARE db_cursor CURSOR FOR
SELECT [name] FROM sysobjects WHERE [type] = 'TR' AND [name] LIKE 'audit_%'

OPEN db_cursor
FETCH NEXT FROM db_cursor INTO @function

WHILE @@FETCH_STATUS = 0
BEGIN
  SELECT @sql = 'DROP TRIGGER IF EXISTS mtc_admin.' + @function
  EXEC sp_executeSql @sql
  FETCH NEXT FROM db_cursor INTO @function
END

CLOSE db_cursor
DEALLOCATE db_cursor
