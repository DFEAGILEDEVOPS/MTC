ALTER TABLE mtc_admin.pupil ADD foreNameAlias [NVARCHAR](128) NULL;
ALTER TABLE mtc_admin.pupil ADD lastNameAlias [NVARCHAR](128) NULL;
DROP INDEX [mtc_admin].[pupil].[idx_azure_recommended_pupil_school];
ALTER TABLE mtc_admin.pupil ALTER COLUMN foreName [NVARCHAR](128) NULL;
ALTER TABLE mtc_admin.pupil ALTER COLUMN lastName [NVARCHAR](128) NULL;
ALTER TABLE mtc_admin.pupil ALTER COLUMN middleNames [NVARCHAR](128) NULL;
ALTER TABLE mtc_admin.[pupil]
ALTER COLUMN foreNameAlias ADD MASKED WITH (FUNCTION = 'default()');
ALTER TABLE mtc_admin.[pupil]
ALTER COLUMN lastNameAlias ADD MASKED WITH (FUNCTION = 'default()');
ALTER TABLE mtc_admin.[pupil]
ALTER COLUMN foreName ADD MASKED WITH (FUNCTION = 'default()');
ALTER TABLE mtc_admin.[pupil]
ALTER COLUMN middleNames ADD MASKED WITH (FUNCTION = 'default()');
ALTER TABLE mtc_admin.[pupil]
ALTER COLUMN lastName ADD MASKED WITH (FUNCTION = 'default()');
CREATE NONCLUSTERED INDEX [idx_azure_recommended_pupil_school] ON [mtc_admin].[pupil] ([school_id]) INCLUDE ([createdAt], [dateOfBirth], [foreName], [gender], [isTestAccount], [job_id], [jwtSecret], [jwtToken], [lastName], [middleNames], [foreNameAlias], [lastNameAlias], [pin], [pinExpiresAt], [pupilAgeReason_id], [pupilStatus_id], [updatedAt], [upn], [urlSlug], [version]) WITH (ONLINE = ON)
