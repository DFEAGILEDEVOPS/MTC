DECLARE @schoolId INT

BEGIN TRY
INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name, pin, pinExpiresAt, urlSlug)
VALUES (999, '1999', 89000, 9991999, 'Test School', 'abc12345', '2025-01-01 00:00:00.000', 'ED443B10-FD26-41FE-AA22-4F220ACB64C1');
SELECT @schoolId = SCOPE_IDENTITY()
END TRY
BEGIN CATCH
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 9991999
END CATCH

INSERT INTO [mtc_admin].pupil (school_id, foreName, middleNames, lastName, gender, dateOfBirth, pinExpiresAt, upn, pin, isTestAccount)
VALUES (@schoolId, 'Standard', 'Dev-Test', 'Pupil', 'M', '2000-01-01 00:00:00.000', '2050-01-01 00:00:00.000', 'N999199900001', '9999a', 1);

INSERT INTO [mtc_admin].pupil (school_id, foreName, middleNames, lastName, gender, dateOfBirth, pinExpiresAt, upn, pin, isTestAccount)
VALUES (@schoolId, 'Speech', 'Dev-Test', 'Pupil', 'F', '2000-03-01 00:00:00.000', '2050-01-01 00:00:00.000', 'C999199900002', '8888a', 1);
