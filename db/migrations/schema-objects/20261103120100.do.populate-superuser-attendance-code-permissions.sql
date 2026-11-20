DECLARE @superuserRoleId INT = (SELECT id FROM [mtc_admin].[role] WHERE title = 'SUPERUSER');
DECLARE @absentId INT = (SELECT id FROM [mtc_admin].[attendanceCode] WHERE code = 'ABSNT');
DECLARE @leftId INT = (SELECT id FROM [mtc_admin].[attendanceCode] WHERE code = 'LEFTT');
DECLARE @incorrectRegistrationId INT = (SELECT id FROM [mtc_admin].[attendanceCode] WHERE code = 'INCRG');
DECLARE @unableToAccessId INT = (SELECT id FROM [mtc_admin].[attendanceCode] WHERE code = 'NOACC');
DECLARE @workingBelowId INT = (SELECT id FROM [mtc_admin].[attendanceCode] WHERE code = 'BLSTD');
DECLARE @justArrivedId INT = (SELECT id FROM [mtc_admin].[attendanceCode] WHERE code = 'JSTAR');
DECLARE @notAbleToAdministerId INT = (SELECT id FROM [mtc_admin].[attendanceCode] WHERE code = 'NOABA');

INSERT INTO [mtc_admin].[attendanceCodeRolePermission] (roleId, attendanceCodeId) VALUES
  (@superuserRoleId, @absentId),
  (@superuserRoleId, @leftId),
  (@superuserRoleId, @incorrectRegistrationId),
  (@superuserRoleId, @unableToAccessId),
  (@superuserRoleId, @workingBelowId),
  (@superuserRoleId, @justArrivedId),
  (@superuserRoleId, @notAbleToAdministerId);
