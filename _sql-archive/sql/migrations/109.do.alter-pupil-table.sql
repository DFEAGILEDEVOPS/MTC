ALTER TABLE [mtc_admin].[pupil] ADD jwtToken nvarchar(max);
ALTER TABLE [mtc_admin].[pupil] ADD jwtSecret nvarchar(max);
ALTER TABLE [mtc_admin].[pupil] DROP COLUMN token;
