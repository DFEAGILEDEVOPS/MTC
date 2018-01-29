DROP INDEX mtc_admin.adminLogonEvent.adminLogonEvent_user_id_index
ALTER TABLE mtc.mtc_admin.adminLogonEvent ALTER COLUMN user_id INT NOT NULL
CREATE INDEX adminLogonEvent_user_id_index ON [mtc_admin].[adminLogonEvent] (user_id)
ALTER TABLE mtc.mtc_admin.adminLogonEvent DROP COLUMN ncaUserName
ALTER TABLE mtc.mtc_admin.adminLogonEvent DROP COLUMN ncaEmailAddress