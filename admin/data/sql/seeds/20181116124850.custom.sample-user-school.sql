DECLARE @schoolId INT

INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name) VALUES (999, '1001', 89001, 9991001, 'Example School One');
SELECT @schoolId = @@IDENTITY
IF @schoolId IS NULL BEGIN
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 9991001
END
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id) 
  VALUES ('teacher1', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3);

INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name) VALUES (999, '1002', 89002, 9991002, 'Example School Two');
SELECT @schoolId = @@IDENTITY
IF @schoolId IS NULL BEGIN
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 9991002
END
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id) 
  VALUES ('teacher2', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3);

INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name) VALUES (999, '1003', 89003, 9991003, 'Example School Three');
SELECT @schoolId = @@IDENTITY
IF @schoolId IS NULL BEGIN
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 9991003
END
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id) 
  VALUES ('teacher3', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3);

INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name) VALUES (999, '1004', 89004, 9991004, 'Example School Four');
SELECT @schoolId = @@IDENTITY
IF @schoolId IS NULL BEGIN
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 9991004
END
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id) 
  VALUES ('teacher4', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3);

INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name) VALUES (999, '1005', 89005, 9991005, 'Example School Five');
SELECT @schoolId = @@IDENTITY
IF @schoolId IS NULL BEGIN
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 9991005
END
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id) 
  VALUES ('teacher5', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3);
