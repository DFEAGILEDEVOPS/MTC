
DECLARE @schoolId INT
-- test users
INSERT INTO dbo.school (leaCode, estabCode, name, pin, pinExpiresAt, urlSlug) 
  VALUES (999, '1999', 'Test School', 'abc12345', '2025-01-01 00:00:00.8160000', 'ED443B10-FD26-41FE-AA22-4F220ACB64C1');
SELECT @schooldId = @@IDENTITY
-- test forms
INSERT INTO dbo.pupil (school_id, foreName, middleNames, lastName, gender, dateOfBirth, pinExpiresAt, upn, pin, speechSynthesis, isTestAccount, urlSlug, token) 
  VALUES (@schoolId, 'Automated', 'Test', 'Account', 'M', '2000-01-01 00:00:00.4090000', '2050-01-01 00:00:00.0820000', 'N999199900001', '9999a', 0, 0, 'C461F048-5645-4B9F-815D-D579042E8143', null);
