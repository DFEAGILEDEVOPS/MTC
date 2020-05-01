DECLARE @techSupportRoleId int
SELECT @techSupportRoleId = id FROM mtc_admin.role WHERE title='TECH-SUPPORT'
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id)
VALUES ('tech-support', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', null, @techSupportRoleId);
