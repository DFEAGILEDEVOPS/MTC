UPDATE mtc_admin.school
SET leaCode = 201
WHERE
  leaCode = 999
AND
  estabCode <> 1004
;


UPDATE mtc_admin.school
SET dfeNumber = CONCAT(CAST(leaCode as VARCHAR), CAST(estabCode as VARCHAR))
WHERE
  leaCode = 201;
