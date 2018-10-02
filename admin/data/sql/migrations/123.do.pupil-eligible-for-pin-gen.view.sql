CREATE VIEW [mtc_admin].vewPupilsEligibleForPinGeneration AS
SELECT
 p.id,
 p.forename,
 p.lastName,
 p.dateOfBirth,
 p.urlSlug,
 p.school_id,
 COUNT(chk.id) AS checkCount
FROM
 [mtc_admin].[pupil] p
  LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (p.id = pa.pupil_id)
  LEFT JOIN [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id)
WHERE
 -- don’t select pupils who are not attending
 pa.id IS NULL
GROUP BY
 p.id,
 p.forename,
 p.lastname,
 p.dateOfBirth,
 p.urlSlug,
 p.school_id
