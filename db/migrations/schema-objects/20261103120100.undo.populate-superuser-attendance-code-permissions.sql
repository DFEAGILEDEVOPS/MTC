DELETE FROM [mtc_admin].[attendanceCodeRolePermission]
WHERE roleId = (SELECT id FROM [mtc_admin].[role] WHERE title = 'SUPERUSER')
AND attendanceCodeId IN (
  SELECT id
  FROM [mtc_admin].[attendanceCode]
  WHERE code IN ('ABSNT', 'LEFTT', 'INCRG', 'NOACC', 'BLSTD', 'JSTAR', 'NOABA')
);
