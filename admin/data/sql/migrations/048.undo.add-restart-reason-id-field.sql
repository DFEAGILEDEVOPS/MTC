ALTER TABLE [mtc_admin].[pupilRestart] DROP CONSTRAINT FK_pupilRestart_pupilRestartReason_id
ALTER TABLE [mtc_admin].[pupilRestart] DROP COLUMN pupilRestartReason_id;
ALTER TABLE [mtc_admin].[pupilRestart] ADD pupilRestartCode_id int NOT NULL;
ALTER TABLE [mtc_admin].[pupilRestart] ADD reason nvarchar(50) NOT NULL;

ALTER TABLE [mtc_admin].[pupilRestart] WITH CHECK ADD CONSTRAINT [FK_pupilRestart_pupilRestartCode_id] FOREIGN KEY([pupilRestartCode_id])
REFERENCES [mtc_admin].[pupilRestartCode] ([id])
