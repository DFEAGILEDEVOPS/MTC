ALTER VIEW [mtc_admin].[vewPupilsEligibleForRestart] AS

  SELECT
         p.id,
         p.foreName,
         p.middleNames,
         p.lastName,
         p.dateOfBirth,
         p.urlSlug,
         p.school_id,
         count(*) as totalCheckCount
  FROM
       [mtc_admin].[pupil] p
         LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (p.id = pa.pupil_id)
         INNER JOIN [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id)
         INNER JOIN [mtc_admin].[checkStatus] AS chkStatus ON (chk.checkStatus_id = chkStatus.id)
         LEFT JOIN [mtc_admin].[pupilRestart] as pr ON (p.id = pr.pupil_id)
  WHERE
          -- don’t select pupils who are not attending
          pa.id IS NULL
          -- pupils must have already attempted 1 or more live checks that are not expired
AND      chkStatus.code IN ('CMP', 'EXP', 'NTR')
AND      chk.isLiveCheck = 1
          -- exclude pupils with an existing unconsumed restart
AND      (pr.id IS NULL OR (pr.id IS NOT NULL AND pr.check_id IS NOT NULL))
GROUP BY
         p.id,
         p.foreName,
         p.middleNames,
         p.lastName,
         p.dateOfBirth,
         p.urlSlug,
         p.school_id
go
