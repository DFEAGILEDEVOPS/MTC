CREATE OR ALTER VIEW [mtc_admin].[vewAttendanceCodePermissions] AS
SELECT
  ac.[id]      as attendanceCodeId,
  ac.[code]    as attendanceCode,
  ac.[reason]  as attendanceCodeReason,
  ac.[order]   as attendanceCodeDisplayOrder,
  ac.[visible] as attendanceCodeIsVisible,
  ro.[id]      as roleId,
  ro.[title]   as roleTitle
FROM
  [mtc_admin].[attendanceCode] ac JOIN
  [mtc_admin].[attendanceCodeRolePermission] acrp ON (ac.id = acrp.attendanceCodeId) JOIN
  [mtc_admin].[role] ro ON (acrp.roleId = ro.id)
;
