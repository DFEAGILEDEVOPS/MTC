-- UNDO populate test schools
UPDATE mtc_admin.school
SET isTestSchool = 0
WHERE leaCode = 999;
