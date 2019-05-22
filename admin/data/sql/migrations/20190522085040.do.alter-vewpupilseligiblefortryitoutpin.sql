ALTER VIEW [mtc_admin].vewPupilsEligibleForTryItOutPin AS
  SELECT
    p.id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    p.school_id,
    g.group_id,
    p.urlSlug
  FROM [mtc_admin].[pupil] p
  LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (p.id = pa.pupil_id and pa.isDeleted = 0)
  LEFT JOIN [mtc_admin].[attendanceCode] ac ON (pa.attendanceCode_id = ac.id )
  LEFT JOIN [mtc_admin].[pupilGroup] g ON (g.pupil_id = p.id)
  LEFT JOIN [mtc_admin].[pupilStatusLink] psl ON p.id = psl.pupil_id
  INNER JOIN [mtc_admin].[pupilStatus] ps ON ISNULL(psl.pupilStatus_id, 1) = ps.id
  LEFT JOIN [mtc_admin].[check] AS chk ON p.id = chk.pupil_id AND chk.isLiveCheck = 0
  LEFT JOIN [mtc_admin].[checkStatus] AS chkStatus ON chk.checkStatus_id = chkStatus.id AND chkStatus.code IN ('NEW', 'STD', 'COL')
  WHERE
    -- include all pupils except those who are marked as not taking check because they left school
    (ac.id IS NULL OR ac.code <> 'LEFTT')
  AND ps.code IN ('UNALLOC',
                  'ALLOC',
                  'LOGGED_IN')
    -- Exclude pupils who already have an active familiarisation check
  AND chkStatus.id IS NULL
