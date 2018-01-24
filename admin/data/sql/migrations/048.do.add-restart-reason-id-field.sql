ALTER TABLE [mtc_admin].[pupilRestart] DROP CONSTRAINT FK_pupilRestart_pupilRestartCode_id
ALTER TABLE [mtc_admin].[pupilRestart] DROP COLUMN reason;
ALTER TABLE [mtc_admin].[pupilRestart] DROP COLUMN pupilRestartCode_id;
ALTER TABLE [mtc_admin].[pupilRestart] ADD pupilRestartReason_id int NOT NULL;

ALTER TABLE [mtc_admin].[pupilRestart] WITH CHECK ADD CONSTRAINT [FK_pupilRestart_pupilRestartReason_id] FOREIGN KEY([pupilRestartReason_id])
REFERENCES [mtc_admin].[pupilRestartReason] ([id])
