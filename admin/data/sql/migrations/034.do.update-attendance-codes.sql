UPDATE [mtc].[mtc_admin].[attendanceCode]
SET reason = 'Left school'
WHERE code = 'LEFTT';

UPDATE [mtc].[mtc_admin].[attendanceCode]
SET [order] = 1
WHERE code = 'INCRG';

UPDATE [mtc].[mtc_admin].[attendanceCode]
SET [order] = 2
WHERE code = 'ABSNT';

UPDATE [mtc].[mtc_admin].[attendanceCode]
SET [order] = 3
WHERE code = 'LEFTT';

INSERT INTO [mtc].[mtc_admin].[attendanceCode] (reason, code, [order]) VALUES
  ('Unable to access', 'NOACC', 4),
  ('Working below the overall standard of the check', 'BLSTD', 5),
  ('Just arrived', 'JSTAR', 6);

DELETE FROM [mtc].[mtc_admin].[attendanceCode]
WHERE code = 'WTDRN';
