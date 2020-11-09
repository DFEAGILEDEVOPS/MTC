-- Drop the constraint introduced by the un-named DEFAULT()
-- we need to find the name first

DECLARE @SQL varchar(2000);
DECLARE @CONSTRAINT_NAME varchar(2000);

SET @CONSTRAINT_NAME = (SELECT name from SYS.DEFAULT_CONSTRAINTS
                        WHERE PARENT_OBJECT_ID = OBJECT_ID('mtc_admin.pupil')
                          AND PARENT_COLUMN_ID = (SELECT column_id FROM sys.columns
                                                  WHERE NAME = N'speechSynthesis'
                                                    AND object_id = OBJECT_ID('mtc_admin.pupil')))

SET @SQL = 'ALTER TABLE [mtc_admin].[pupil] DROP CONSTRAINT ' + @CONSTRAINT_NAME
EXEC sp_sqlexec @SQL;

DROP INDEX [mtc_admin].[pupil].[idx_azure_recommended_pupil_school];

ALTER TABLE  [mtc_admin].[pupil] DROP COLUMN [speechSynthesis];

CREATE NONCLUSTERED INDEX [idx_azure_recommended_pupil_school] ON [mtc_admin].[pupil] ([school_id]) INCLUDE ([createdAt], [dateOfBirth], [foreName], [gender], [isTestAccount], [job_id], [jwtSecret], [jwtToken], [lastName], [middleNames], [pin], [pinExpiresAt], [pupilAgeReason_id], [pupilStatus_id], [updatedAt], [upn], [urlSlug], [version]) WITH (ONLINE = ON)

