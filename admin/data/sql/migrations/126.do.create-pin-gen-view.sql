CREATE VIEW [mtc_admin].vewPupilsEligibleForPinGeneration AS
  SELECT
         p.id,
         p.foreName,
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
      -- don't select pupils who already have a check
  GROUP BY
           p.id,
           p.foreName,
           p.lastName,
           p.dateOfBirth,
           p.urlSlug,
           p.school_id
  HAVING
    -- only select pupils who don't already have a check
    count(chk.id) = 0
