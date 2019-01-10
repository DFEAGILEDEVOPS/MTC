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
  WHERE
      -- don’t select pupils who are not attending
      pa.id IS NULL
      -- pupils must have already attempted 1 or more checks that are not expired
    AND       chkStatus.code <> 'EXP'
    AND       chk.isLiveCheck = 1
  GROUP BY
           p.id,
           p.foreName,
           p.middleNames,
           p.lastName,
           p.dateOfBirth,
           p.urlSlug,
           p.school_id
;
