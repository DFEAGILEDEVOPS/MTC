-- Seed data script for local-dev
-- Modify the schools to make them non-test, except school 4

UPDATE mtc_admin.school
SET
  leaCode = 201,
  dfeNumber = CAST(CONCAT('201', CAST(estabCode as VARCHAR)) as INT),
  isTestSchool = 0
WHERE
  leaCode = 999
AND
  estabCode <> 1004
;


-- We can now run the same code as the data migration, but this time for local-dev / seed consumers
UPDATE mtc_admin.school
SET isTestSchool = 1
WHERE leaCode = 999
;
