DROP INDEX checkWindow_urlSlug_uindex ON [mtc_admin].[checkWindow];

-- Drop the constraint introduced by the un-named DEFAULT()
-- we need to find the name first

DECLARE @SQL varchar(2000);
DECLARE @CONSTRAINT_NAME varchar(2000);

SET @CONSTRAINT_NAME = (SELECT name from SYS.DEFAULT_CONSTRAINTS
                      WHERE PARENT_OBJECT_ID = OBJECT_ID('mtc_admin.checkWindow')
                        AND PARENT_COLUMN_ID = (SELECT column_id FROM sys.columns
                                                WHERE NAME = N'urlSlug'
                                                  AND object_id = OBJECT_ID('mtc_admin.checkWindow')))

SET @SQL = 'ALTER TABLE [mtc_admin].[checkWindow] DROP CONSTRAINT ' + @CONSTRAINT_NAME
EXEC sp_sqlexec @SQL;


ALTER TABLE [mtc_admin].[checkWindow] DROP COLUMN urlSlug;
