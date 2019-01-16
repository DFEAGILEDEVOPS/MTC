ALTER TABLE [mtc_admin].[settings] ADD checkTimeLimit TINYINT NOT NULL CONSTRAINT temp_default_check_limit DEFAULT 30;
ALTER TABLE [mtc_admin].[settings] DROP CONSTRAINT temp_default_check_limit
ALTER TABLE [mtc_admin].[settingsLog] ADD checkTimeLimit TINYINT NULL;