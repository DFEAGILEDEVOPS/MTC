ALTER TABLE [mtc_admin].[pupil] DROP COLUMN jwtToken;
ALTER TABLE [mtc_admin].[pupil] DROP COLUMN jwtSecret;
ALTER TABLE [mtc_admin].[pupil] ADD token nvarchar(max);
