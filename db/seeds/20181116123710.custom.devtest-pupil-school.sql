DECLARE @schoolId INT

BEGIN TRY
INSERT INTO [mtc_admin].school (leaCode, estabCode, urn, dfeNumber, name, urlSlug, pin, pinExpiresAt)
VALUES (201, '1999', 89000, 2011999, 'Test School', NEWID(), 'abc22def', DATEADD(DAY, 1, GETUTCDATE()));
SELECT @schoolId = SCOPE_IDENTITY()
END TRY
BEGIN CATCH
SELECT @schoolId = id FROM [mtc_admin].school WHERE dfeNumber = 2011999
END CATCH

INSERT INTO [mtc_admin].pupil (school_id, foreName, middleNames, lastName, gender, dateOfBirth, upn,  isTestAccount)
VALUES (@schoolId, 'Standard', 'Dev-Test', 'Pupil', 'M', '2000-01-01 00:00:00.000', 'N999199900001', 1);

INSERT INTO [mtc_admin].pupil (school_id, foreName, middleNames, lastName, gender, dateOfBirth, upn, isTestAccount)
VALUES (@schoolId, 'Speech', 'Dev-Test', 'Pupil', 'F', '2000-03-01 00:00:00.000',  'C999199900002', 1);
