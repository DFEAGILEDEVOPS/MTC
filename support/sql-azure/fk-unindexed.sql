-- https://www.sqlshack.com/index-foreign-key-columns-sql-server/
CREATE TABLE #TempForeignKeys (TableName varchar(100), ForeignKeyName varchar(100) , ObjectID int)
INSERT INTO #TempForeignKeys 
SELECT OBJ.NAME, ForKey.NAME, ForKey .[object_id] 
FROM sys.foreign_keys ForKey
INNER JOIN sys.objects OBJ
ON OBJ.[object_id] = ForKey.[parent_object_id]
WHERE OBJ.is_ms_shipped = 0
 
CREATE TABLE #TempIndexedFK (ObjectID int)
INSERT INTO #TempIndexedFK  
SELECT ObjectID      
FROM sys.foreign_key_columns ForKeyCol
JOIN sys.index_columns IDXCol
ON ForKeyCol.parent_object_id = IDXCol.[object_id]
JOIN #TempForeignKeys FK
ON  ForKeyCol.constraint_object_id = FK.ObjectID
WHERE ForKeyCol.parent_column_id = IDXCol.column_id 
 
SELECT * FROM #TempForeignKeys WHERE ObjectID NOT IN (SELECT ObjectID FROM #TempIndexedFK)
 
DROP TABLE #TempForeignKeys
DROP TABLE #TempIndexedFK