---
--- Add new AttendanceCode "Not able to administer"
---
INSERT INTO [mtc_admin].[attendanceCode] ([order], reason, code, isPrivileged, visible) VALUES (80, 'Not able to administer', 'NOABA', 1, 1);

--
-- Populate the attendanceCode / Role junction table with permisions to define
-- which roles can use which attendance codes.
--

-- All the available non-sitting codes
DECLARE @absentId INT = (SELECT id FROM [mtc_admin].[attendanceCode] WHERE code = 'ABSNT');
DECLARE @leftId INT = (SELECT id FROM [mtc_admin].[attendanceCode] WHERE code = 'LEFTT');
DECLARE @incorrectRegistrationId INT = (SELECT id FROM [mtc_admin].[attendanceCode] WHERE code = 'INCRG');
DECLARE @unableToAccessId INT = (SELECT id FROM [mtc_admin].[attendanceCode] WHERE code = 'NOACC');
DECLARE @workingBelowId INT = (SELECT id FROM [mtc_admin].[attendanceCode] WHERE code = 'BLSTD');
DECLARE @justArrivedId INT = (SELECT id FROM [mtc_admin].[attendanceCode] WHERE code = 'JSTAR');
DECLARE @maladminId INT = (SELECT id FROM [mtc_admin].[attendanceCode] WHERE code = 'ANLLQ');
DECLARE @cheatingId INT = (SELECT id FROM [mtc_admin].[attendanceCode] WHERE code = 'ANLLH');
DECLARE @notAbleToAdministerId INT = (SELECT id FROM [mtc_admin].[attendanceCode] WHERE code = 'NOABA');

-- Service manager role
DECLARE @serviceManagerRoleId INT = (SELECT id FROM [mtc_admin].[role] WHERE title = 'SERVICE-MANAGER');
INSERT INTO [mtc_admin].[attendanceCodeRolePermission] (roleId, attendanceCodeId) VALUES
  (@serviceManagerRoleId, @absentId),
  (@serviceManagerRoleId, @leftId),
  (@serviceManagerRoleId, @incorrectRegistrationId),
  (@serviceManagerRoleId, @unableToAccessId),
  (@serviceManagerRoleId, @workingBelowId),
  (@serviceManagerRoleId, @justArrivedId),
  (@serviceManagerRoleId, @maladminId),
  (@serviceManagerRoleId, @cheatingId)
;

-- -- STA-Admin role
DECLARE @staAdminRoleId INT = (SELECT id FROM [mtc_admin].[role] WHERE title = 'STA-ADMIN');
INSERT INTO [mtc_admin].[attendanceCodeRolePermission] (roleId, attendanceCodeId) VALUES
  (@staAdminRoleId, @absentId),
  (@staAdminRoleId, @leftId),
  (@staAdminRoleId, @incorrectRegistrationId),
  (@staAdminRoleId, @unableToAccessId),
  (@staAdminRoleId, @workingBelowId),
  (@staAdminRoleId, @justArrivedId),
  (@staAdminRoleId, @notAbleToAdministerId)
;

-- teacher role
DECLARE @teacherRoleId INT = (SELECT id FROM [mtc_admin].[role] WHERE title = 'TEACHER');
INSERT INTO [mtc_admin].[attendanceCodeRolePermission] (roleId, attendanceCodeId) VALUES
  (@teacherRoleId, @absentId),
  (@teacherRoleId, @leftId),
  (@teacherRoleId, @incorrectRegistrationId),
  (@teacherRoleId, @unableToAccessId),
  (@teacherRoleId, @workingBelowId),
  (@teacherRoleId, @justArrivedId)
;

-- helpdesk role
-- teacher role
DECLARE @helpdeskRoleId INT = (SELECT id FROM [mtc_admin].[role] WHERE title = 'HELPDESK');
INSERT INTO [mtc_admin].[attendanceCodeRolePermission] (roleId, attendanceCodeId) VALUES
  (@helpdeskRoleId, @absentId),
  (@helpdeskRoleId, @leftId),
  (@helpdeskRoleId, @incorrectRegistrationId),
  (@helpdeskRoleId, @unableToAccessId),
  (@helpdeskRoleId, @workingBelowId),
  (@helpdeskRoleId, @justArrivedId)
;

-- Tech Support role - no perms required
-- Test developer role - no perms required
