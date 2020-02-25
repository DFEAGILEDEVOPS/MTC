ALTER TABLE mtc_admin.accessArrangements ALTER COLUMN description NVARCHAR(80) NOT NULL
UPDATE mtc_admin.accessArrangements SET description='Pause - ''next'' button between questions' WHERE code='NBQ'
UPDATE mtc_admin.accessArrangements SET description='Input assistance (reason and input assistant''s name required)' WHERE code='ITA'
UPDATE mtc_admin.accessArrangements SET description='Audio version (reason required)' WHERE code='QNR'
