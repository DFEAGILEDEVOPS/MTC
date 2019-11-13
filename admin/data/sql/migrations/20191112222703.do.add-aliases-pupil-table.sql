DROP INDEX [mtc_admin].[pupil].[idx_azure_recommended_pupil_school];
ALTER TABLE mtc_admin.pupil ALTER COLUMN foreName [NVARCHAR](128) NULL;
ALTER TABLE mtc_admin.pupil ALTER COLUMN lastName [NVARCHAR](128) NULL;
ALTER TABLE mtc_admin.pupil ALTER COLUMN middleNames [NVARCHAR](128) NULL;
CREATE NONCLUSTERED INDEX [idx_azure_recommended_pupil_school] ON [mtc_admin].[pupil] ([school_id]) INCLUDE ([createdAt], [dateOfBirth], [foreName], [gender], [isTestAccount], [job_id], [jwtSecret], [jwtToken], [lastName], [middleNames], [pin], [pinExpiresAt], [pupilAgeReason_id], [pupilStatus_id], [updatedAt], [upn], [urlSlug], [version]) WITH (ONLINE = ON)
ALTER TABLE mtc_admin.pupil ADD foreNameAlias [NVARCHAR](128) NULL;
ALTER TABLE mtc_admin.pupil ADD lastNameAlias [NVARCHAR](128) NULL;
