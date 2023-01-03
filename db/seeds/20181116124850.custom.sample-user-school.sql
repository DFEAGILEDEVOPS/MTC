DECLARE @schoolId INT

BEGIN TRY
INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name, pin, pinExpiresAt) VALUES (999, '1001', 89001, 9991001, 'Example School One', 'aaa22aaa', DATEADD(DAY, 1, GETUTCDATE()));
SELECT @schoolId = SCOPE_IDENTITY()
END TRY
BEGIN CATCH
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 9991001
END CATCH
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id, displayName)
  VALUES ('teacher1', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3, 'Teacher 1 Local User');

BEGIN TRY
INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name, pin, pinExpiresAt) VALUES (999, '1002', 89002, 9991002, 'Example School Two', 'bbb22bbb', DATEADD(DAY, 1, GETUTCDATE()));
SELECT @schoolId = SCOPE_IDENTITY()
END TRY
BEGIN CATCH
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 9991002
END CATCH
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id, displayName)
  VALUES ('teacher2', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3, 'Teacher 2 Local User');

BEGIN TRY
INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name, pin, pinExpiresAt) VALUES (999, '1003', 89003, 9991003, 'Example School Three', 'ccc33ccc', DATEADD(DAY, 1, GETUTCDATE()));
SELECT @schoolId = SCOPE_IDENTITY()
END TRY
BEGIN CATCH
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 9991003
END CATCH
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id, displayName)
  VALUES ('teacher3', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3, 'Teacher 3 Local User');

BEGIN TRY
INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name, pin, pinExpiresAt) VALUES (999, '1004', 89004, 9991004, 'Example School Four', 'ddd44ddd', DATEADD(DAY, 1, GETUTCDATE()));
SELECT @schoolId = SCOPE_IDENTITY()
END TRY
BEGIN CATCH
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 9991004
END CATCH
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id, displayName)
  VALUES ('teacher4', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3, 'Teacher 4 Local User');

BEGIN TRY
INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name, pin, pinExpiresAt) VALUES (999, '1005', 89005, 9991005, 'Example School Five', 'eee55eee', DATEADD(DAY, 1, GETUTCDATE()));
SELECT @schoolId = SCOPE_IDENTITY()
END TRY
BEGIN CATCH
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 9991005
END CATCH
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id, displayName)
  VALUES ('teacher5', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3, 'Teacher 5 Local User');
