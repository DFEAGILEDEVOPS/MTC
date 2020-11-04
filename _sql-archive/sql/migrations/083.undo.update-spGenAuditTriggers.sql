ALTER PROCEDURE mtc_admin.spGenAuditTriggers AS

DECLARE @schema NVARCHAR(20) = 'mtc_admin'
DECLARE @table NVARCHAR(255)
DECLARE @sql NVARCHAR(MAX)
DECLARE @triggerName NVARCHAR(MAX)
DECLARE @dropSql NVARCHAR(MAX)
  
DECLARE db_cursor CURSOR FOR
SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_TYPE='BASE TABLE' AND TABLE_SCHEMA=@schema AND TABLE_NAME != 'auditLog'

OPEN db_cursor
FETCH NEXT FROM db_cursor INTO @schema, @table

WHILE @@FETCH_STATUS = 0
BEGIN
      SELECT @triggerName = @schema + '.audit_' + @table
      SELECT @sql = 'CREATE TRIGGER ' + @triggerName + ' ON [' + @schema + '].[' + @table + '] FOR UPDATE, INSERT, DELETE
AS
  BEGIN
    DECLARE @json nvarchar(max)
    DECLARE @table nvarchar(255) = ''' + @table + '''
    DECLARE @operation varchar(50)='''';
    IF EXISTS (SELECT * FROM inserted) and  EXISTS (SELECT * FROM deleted)
    BEGIN
      SELECT @operation = ''UPDATE''
      SELECT @json = (SELECT * FROM inserted FOR JSON PATH, ROOT(''' + @table +  '''))
    END
    ELSE IF EXISTS(SELECT * FROM inserted)
    BEGIN
      SELECT @operation = ''INSERT''
      SELECT @json = (SELECT * FROM inserted FOR JSON PATH, ROOT(''' + @table +  '''))
    END
    ElSE IF EXISTS(SELECT * FROM deleted)
    BEGIN
      SELECT @operation = ''DELETE''
      SELECT @json = (SELECT * FROM deleted FOR JSON PATH, ROOT(''' + @table +  '''))
    END
    ELSE
      RETURN

    INSERT INTO ' + @schema + '.auditLog (rowData, tableName, operation) VALUES (@json, ''' + @table + ''', @operation)
  END'
  -- PRINT @sql
  EXEC sp_executeSql @sql

      FETCH NEXT FROM db_cursor INTO @schema, @table
END

CLOSE db_cursor
DEALLOCATE db_cursor
