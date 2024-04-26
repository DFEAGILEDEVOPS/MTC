CREATE OR ALTER VIEW [mtc_admin].[vewAttendanceCodePermissions] AS
SELECT
  ac.code as attendancecode,
  r.title as roleTitle,
  ac.[order] as attendanceCodeOrder,
  ac.visible as attendanceCodeIsVisible
FROM
  [mtc_admin].[attendanceCode] ac JOIN [mtc_admin].[attendanceCodeRolePermission] acrp ON (ac.id = acrp.attendanceCodeId)
  JOIN [mtc_admin].[role] r ON (acrp.roleId = r.id)
