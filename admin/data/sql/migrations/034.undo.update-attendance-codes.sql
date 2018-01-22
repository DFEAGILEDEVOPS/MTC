UPDATE [mtc].[mtc_admin].[attendanceCode]
SET reason = 'Left'
WHERE code = 'LEFTT';

UPDATE [mtc].[mtc_admin].[attendanceCode]
SET [order] = 3
WHERE code = 'INCRG';

UPDATE [mtc].[mtc_admin].[attendanceCode]
SET [order] = 1
WHERE code = 'ABSNT';

UPDATE [mtc].[mtc_admin].[attendanceCode]
SET [order] = 2
WHERE code = 'LEFTT';

INSERT INTO [mtc].[mtc_admin].[attendanceCode] (reason, code, [order]) VALUES
  ('Withdran', 'WTDRN', 4);

DELETE FROM [mtc].[mtc_admin].[attendanceCode]
WHERE code IN ('NOACC', 'BLSTD', 'JSTAR');


