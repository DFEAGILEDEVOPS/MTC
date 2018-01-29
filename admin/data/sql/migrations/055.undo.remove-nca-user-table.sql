ALTER TABLE mtc.mtc_admin.adminLogonEvent ADD ncaUserName NVARCHAR(MAX) NULL
ALTER TABLE mtc.mtc_admin.adminLogonEvent ADD ncaEmailAddress NVARCHAR(MAX) NULL
ALTER TABLE mtc.mtc_admin.adminLogonEvent ALTER COLUMN user_id INT NULL