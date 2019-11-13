DROP INDEX [mtc_admin].[pupil].[idx_azure_recommended_pupil_school];
ALTER TABLE mtc_admin.pupil ALTER COLUMN middleNames [NVARCHAR](MAX) NULL;
ALTER TABLE mtc_admin.pupil ALTER COLUMN lastName [NVARCHAR](MAX) NULL;
ALTER TABLE mtc_admin.pupil ALTER COLUMN foreName [NVARCHAR](MAX) NULL;
CREATE NONCLUSTERED INDEX [idx_azure_recommended_pupil_school] ON [mtc_admin].[pupil] ([school_id]) INCLUDE ([createdAt], [dateOfBirth], [foreName], [gender], [isTestAccount], [job_id], [jwtSecret], [jwtToken], [lastName], [middleNames], [pin], [pinExpiresAt], [pupilAgeReason_id], [pupilStatus_id], [updatedAt], [upn], [urlSlug], [version]) WITH (ONLINE = ON);
ALTER TABLE mtc_admin.pupil DROP COLUMN lastNameAlias;
ALTER TABLE mtc_admin.pupil DROP COLUMN foreNameAlias;
