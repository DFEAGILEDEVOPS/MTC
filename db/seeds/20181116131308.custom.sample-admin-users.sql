DECLARE @schoolId INT

SELECT @schoolId = 1
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id, displayName)
VALUES ('test-developer', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', NULL, 2, 'Test Developer Local Account');

INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id, displayName)
VALUES ('service-manager', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', NULL, 1, 'Service Manger Local Account');
