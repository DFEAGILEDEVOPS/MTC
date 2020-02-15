DECLARE @schoolId INT

BEGIN TRY
INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name, pin, pinExpiresAt) VALUES (999, '1001', 89001, 9991001, 'Example School One', 'foo12foo', DATEADD(DAY, 1, GETUTCDATE()));
SELECT @schoolId = SCOPE_IDENTITY()
END TRY
BEGIN CATCH
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 9991001
END CATCH
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id)
  VALUES ('teacher1', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3);

BEGIN TRY
INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name, pin, pinExpiresAt) VALUES (999, '1002', 89002, 9991002, 'Example School Two', 'bar12bar', DATEADD(DAY, 1, GETUTCDATE()));
SELECT @schoolId = SCOPE_IDENTITY()
END TRY
BEGIN CATCH
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 9991002
END CATCH
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id)
  VALUES ('teacher2', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3);

BEGIN TRY
INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name, pin, pinExpiresAt) VALUES (999, '1003', 89003, 9991003, 'Example School Three', 'baz12baz', DATEADD(DAY, 1, GETUTCDATE()));
SELECT @schoolId = SCOPE_IDENTITY()
END TRY
BEGIN CATCH
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 9991003
END CATCH
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id)
  VALUES ('teacher3', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3);

BEGIN TRY
INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name, pin, pinExpiresAt) VALUES (999, '1004', 89004, 9991004, 'Example School Four', 'qux12qux', DATEADD(DAY, 1, GETUTCDATE()));
SELECT @schoolId = SCOPE_IDENTITY()
END TRY
BEGIN CATCH
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 9991004
END CATCH
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id)
  VALUES ('teacher4', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3);

BEGIN TRY
INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name, pin, pinExpiresAt) VALUES (999, '1005', 89005, 9991005, 'Example School Five', 'qix12qix', DATEADD(DAY, 1, GETUTCDATE()));
SELECT @schoolId = SCOPE_IDENTITY()
END TRY
BEGIN CATCH
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 9991005
END CATCH
INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id)
  VALUES ('teacher5', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolId, 3);
