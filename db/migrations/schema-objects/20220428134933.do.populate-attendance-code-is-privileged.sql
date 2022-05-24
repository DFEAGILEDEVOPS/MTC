UPDATE [mtc_admin].[attendanceCode]
SET isPrivileged = 0 WHERE code <> 'ANLLD';

UPDATE [mtc_admin].[attendanceCode]
SET isPrivileged = 1 WHERE code = 'ANLLD';

