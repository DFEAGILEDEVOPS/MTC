DECLARE @sql NVARCHAR(MAX)

SELECT TOP 1 @sql = N'ALTER TABLE [mtc_admin].[group] DROP CONSTRAINT ['+dc.NAME+N']'
from sys.default_constraints dc
JOIN sys.columns c
    ON c.default_object_id = dc.object_id
WHERE
    dc.parent_object_id = OBJECT_ID('[mtc_admin].[group]')
AND c.name = N'isDeleted'
IF @@ROWCOUNT = 1 EXEC (@sql)

ALTER TABLE mtc_admin.[group] DROP COLUMN isDeleted
