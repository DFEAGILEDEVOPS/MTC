
/*
    the hdf.confirmed default is created without a specific name
    and hence ends up being allocated at runtime.
    This means we must locate the object dynamically to drop it.
*/

DECLARE @hdfTableId int = (
SELECT object_id FROM sys.objects
        WHERE [name] = 'hdf'
            AND type = 'U')

 DECLARE @defaultName nvarchar(max) = (SELECT [name] FROM sys.objects
         WHERE parent_object_id = @hdfTableId
            AND [name] LIKE '%confirm%'
            AND type = 'D')

DECLARE @sql NVARCHAR(MAX)
SELECT @sql = 'ALTER TABLE [mtc_admin].[hdf] DROP CONSTRAINT ' + @defaultName
EXEC sp_executesql @sql
