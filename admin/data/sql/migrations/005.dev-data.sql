-- test users
INSERT INTO dbo.school (createdAt, updatedAt, leaCode, estabCode, name, pin, pinExpiresAt, urlSlug) VALUES ('2017-12-07 07:13:58.5200000', null, 999, '1999', 'Test School', 'abc12345', '2025-01-01 00:00:00.8160000', 'ED443B10-FD26-41FE-AA22-4F220ACB64C1');
-- test forms
INSERT INTO dbo.pupil (createdAt, updatedAt, school_id, foreName, middleNames, lastName, gender, dateOfBirth, pinExpiresAt, upn, pin, speechSynthesis, isTestAccount, urlSlug, token) VALUES ('2017-12-07 07:17:04.4633333', '2017-12-07 07:17:04.4633333', 1, 'Automated', 'Test', 'Account', 'M', '2000-01-01 00:00:00.4090000', '2050-01-01 00:00:00.0820000', 'N999199900001', '9999a', 0, 0, 'C461F048-5645-4B9F-815D-D579042E8143', null);
