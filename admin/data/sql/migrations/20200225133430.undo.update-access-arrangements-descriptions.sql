UPDATE mtc_admin.accessArrangements SET description='''Next'' button between questions (reason required)' WHERE code='NBQ'
UPDATE mtc_admin.accessArrangements SET description='Input assistance (reason required)' WHERE code='ITA'
UPDATE mtc_admin.accessArrangements SET description='Question reader (reason required)' WHERE code='QNR'
ALTER TABLE mtc_admin.accessArrangements ALTER COLUMN description NVARCHAR(50) NOT NULL
