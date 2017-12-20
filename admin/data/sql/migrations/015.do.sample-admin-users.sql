DECLARE @schoolId INT

SELECT @schoolId = 1
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id) 
  VALUES ('test-developer', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 2);

INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id) 
  VALUES ('service-manager', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 1);


