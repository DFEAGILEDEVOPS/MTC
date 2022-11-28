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
