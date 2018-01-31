IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[mtc_admin].[adminLogonEvent_user_id_check]'))
DROP TRIGGER [mtc_admin].[adminLogonEvent_user_id_check]