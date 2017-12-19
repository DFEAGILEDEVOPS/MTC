DECLARE @schoolId INT

INSERT INTO [mtc_admin].school (leaCode, estabCode, name) VALUES (999, '1001', 'Example School One');
SELECT @schoolId = @@IDENTITY
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id) 
  VALUES ('teacher1', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3);

INSERT INTO [mtc_admin].school (leaCode, estabCode, name) VALUES (999, '1002', 'Example School Two');
SELECT @schoolId = @@IDENTITY
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id) 
  VALUES ('teacher2', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3);

INSERT INTO [mtc_admin].school (leaCode, estabCode, name) VALUES (999, '1003', 'Example School Three');
SELECT @schoolId = @@IDENTITY
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id) 
  VALUES ('teacher3', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3);

INSERT INTO [mtc_admin].school (leaCode, estabCode, name) VALUES (999, '1004', 'Example School Four');
SELECT @schoolId = @@IDENTITY
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id) 
  VALUES ('teacher4', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3);

INSERT INTO [mtc_admin].school (leaCode, estabCode, name) VALUES (999, '1005', 'Example School Five');
SELECT @schoolId = @@IDENTITY
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id) 
  VALUES ('teacher5', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3);


