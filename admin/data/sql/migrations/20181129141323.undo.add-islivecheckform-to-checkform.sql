DECLARE @SQL varchar(2000);
DECLARE @CONSTRAINT_NAME varchar(2000);

SET @CONSTRAINT_NAME = (SELECT name from SYS.DEFAULT_CONSTRAINTS
                        WHERE PARENT_OBJECT_ID = OBJECT_ID('mtc_admin.checkForm')
                          AND PARENT_COLUMN_ID = (SELECT column_id FROM sys.columns
                                                  WHERE NAME = N'isLiveCheckForm'
                                                    AND object_id = OBJECT_ID('mtc_admin.checkForm')))

SET @SQL = 'ALTER TABLE [mtc_admin].[checkForm] DROP CONSTRAINT ' + @CONSTRAINT_NAME
EXEC sp_sqlexec @SQL;

ALTER TABLE [mtc_admin].checkForm DROP COLUMN isLiveCheckForm;
