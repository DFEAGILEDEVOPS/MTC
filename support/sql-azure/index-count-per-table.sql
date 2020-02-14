-- https://blog.sqlauthority.com/2012/10/09/sql-server-identify-numbers-of-non-clustered-index-on-tables-for-entire-database/
SELECT COUNT(i.TYPE) NoOfIndex,
[schema_name] = s.name, table_name = o.name
FROM sys.indexes i
INNER JOIN sys.objects o ON i.[object_id] = o.[object_id] INNER JOIN sys.schemas s ON o.[schema_id] = s.[schema_id] WHERE o.TYPE IN ('U')
AND i.TYPE = 2
GROUP BY s.name, o.name
ORDER BY schema_name, table_name