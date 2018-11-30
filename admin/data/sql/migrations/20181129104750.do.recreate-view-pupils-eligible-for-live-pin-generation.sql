CREATE VIEW [mtc_admin].vewPupilsEligibleForLivePinGeneration AS
  SELECT
         p.id,
         p.foreName,
         p.middleNames,
         p.lastName,
         p.dateOfBirth,
         p.urlSlug,
         p.school_id,
         g.group_id,
         CAST (0 as bit) as isRestart,
         (SELECT NULL) as pupilRestart_id
  FROM
       [mtc_admin].[pupil] p
         LEFT JOIN [mtc_admin].[pupilGroup] g ON (g.pupil_id = p.id)
         LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (p.id = pa.pupil_id)
         LEFT JOIN [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id AND chk.isLiveCheck = 1)
         LEFT JOIN [mtc_admin].[checkStatus] AS chkStatus ON (chk.checkStatus_id = chkStatus.id)
  WHERE
        -- don’t select pupils who are not attending
        pa.id IS NULL
         -- only select live checks
  GROUP BY
         p.id,
         p.foreName,
         p.middleNames,
         p.lastName,
         p.dateOfBirth,
         p.urlSlug,
         p.school_id,
         g.group_id
  HAVING
         -- include all pupils who haven't taken a check
         count(chk.id) = 0


  UNION

    -- include pupils who only have expired checks and no other checks
  SELECT
         expChk.id,
         expChk.foreName,
         expChk.middleNames,
         expChk.lastName,
         expChk.dateOfBirth,
         expChk.urlSlug,
         expChk.school_id,
         expChk.group_id,
         CAST (0 as bit) as isRestart,
         (SELECT NULL) as pupilRestart_id
  FROM
       (SELECT
               p.id,
               p.foreName,
               p.middleNames,
               p.lastName,
               p.dateOfBirth,
               p.urlSlug,
               p.school_id,
               g.group_id,
               chkStatus.code,
               count(chkStatus.code) as expiredCheckCount

        FROM
             [mtc_admin].[pupil] p INNER JOIN
                 [mtc_admin].[check] chk on (p.id = chk.pupil_id AND chk.isLiveCheck = 1) INNER JOIN
                 [mtc_admin].[checkStatus] AS chkStatus ON (chk.checkStatus_id = chkStatus.id)
                 LEFT JOIN  [mtc_admin].[pupilGroup] g ON (g.pupil_id = p.id)
        WHERE
            chkStatus.code = 'EXP'
        GROUP BY
               p.id,
               p.foreName,
               p.middleNames,
               p.lastName,
               p.dateOfBirth,
               p.urlSlug,
               p.school_id,
               g.group_id,
               chkStatus.code) as expChk
         LEFT JOIN
           (SELECT
                   p.id,
                   p.foreName,
                   p.middleNames,
                   p.lastName,
                   p.dateOfBirth,
                   p.urlSlug,
                   p.school_id,
                   g.group_id,
                   chkStatus.code,
                   count(chkStatus.code) as otherCheckCount
            FROM
                 [mtc_admin].[pupil] p INNER JOIN
                     [mtc_admin].[check] chk on (p.id = chk.pupil_id AND isLiveCheck = 1) INNER JOIN
                     [mtc_admin].[checkStatus] AS chkStatus ON (chk.checkStatus_id = chkStatus.id)
                     LEFT JOIN  [mtc_admin].[pupilGroup] g ON (g.pupil_id = p.id)
            WHERE
                chkStatus.code <> 'EXP'
            GROUP BY
                   p.id,
                   p.foreName,
                   p.middleNames,
                   p.lastName,
                   p.dateOfBirth,
                   p.urlSlug,
                   p.school_id,
                   g.group_id,
                   chkStatus.code) as otherChk ON (expChk.id = otherChk.id)
  WHERE
      (otherCheckCount IS NULL OR otherCheckCount = 0)

  UNION

    -- add pupils who have an unconsumed restart pending
  SELECT
         p.id,
         p.foreName,
         p.middleNames,
         p.lastName,
         p.dateOfBirth,
         p.urlSlug,
         p.school_id,
         g.group_id,
         CAST (1 as bit) as isRestart,
         pr.id as pupilRestart_id
  FROM
         [mtc_admin].[pupil] p INNER JOIN
         [mtc_admin].[pupilRestart] pr ON (p.id = pr.pupil_id)
         LEFT JOIN  [mtc_admin].[pupilGroup] g ON (g.pupil_id = p.id)
  WHERE
          -- select only unconsumed restarts
          pr.check_id IS NULL
  AND     pr.isDeleted = 0
;
