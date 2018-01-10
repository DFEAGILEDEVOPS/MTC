ALTER TABLE [mtc_admin].[adminLogonEvent] DROP COLUMN [errorMsg];
DROP INDEX [mtc_admin].[adminLogonEvent].[adminLogonEvent_user_id_index];