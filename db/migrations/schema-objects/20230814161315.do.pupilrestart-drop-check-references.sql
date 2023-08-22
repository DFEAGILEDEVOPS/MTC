DROP INDEX [pupilRestart_check_id_index]
    ON [mtc_admin].[pupilRestart];

DROP INDEX [pupilRestart_originCheck_id_index]
    ON [mtc_admin].[pupilRestart];

ALTER TABLE [mtc_admin].[pupilRestart] DROP CONSTRAINT [FK_pupilRestart_check_id_check_id];

ALTER TABLE [mtc_admin].[pupilRestart] DROP CONSTRAINT [FK_pupilRestart_originCheck_id];

ALTER TABLE [mtc_admin].[pupilRestart] DROP COLUMN [check_id], COLUMN [originCheck_id];

