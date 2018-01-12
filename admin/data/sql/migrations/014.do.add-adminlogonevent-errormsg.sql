ALTER TABLE [mtc_admin].[adminLogonEvent] ADD errorMsg NVARCHAR(max) NULL ;
CREATE INDEX adminLogonEvent_user_id_index ON [mtc_admin].[adminLogonEvent] (user_id)