ALTER VIEW [mtc_admin].[vewPupilsEligibleForRestart] AS

  SELECT
    p.id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    p.urlSlug,
    p.school_id,
    pg.group_id,
    count(*) as totalCheckCount
  FROM
    [mtc_admin].[pupil] p
      LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (p.id = pa.pupil_id and pa.isDeleted = 0)
      INNER JOIN [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id)
      INNER JOIN [mtc_admin].[checkStatus] AS chkStatus ON (chk.checkStatus_id = chkStatus.id)
      LEFT JOIN [mtc_admin].[pupilGroup] pg ON p.id = pg.pupil_id
      LEFT JOIN [mtc_admin].[pupilRestart] pr ON pr.pupil_id = p.id AND pr.isDeleted = 0 AND pr.check_id IS NULL
  WHERE
    -- don’t select pupils who are not attending
    pa.id IS NULL
    -- pupils must have already attempted 1 or more checks that are started, complete, not received
    AND   chkStatus.code IN ('STD', 'CMP', 'NTR')
    AND   chk.isLiveCheck = 1
    -- remove pupils with unconsumed restarts
    AND   pr.id IS NULL
  GROUP BY
    p.id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    p.urlSlug,
    p.school_id,
    pg.group_id
;