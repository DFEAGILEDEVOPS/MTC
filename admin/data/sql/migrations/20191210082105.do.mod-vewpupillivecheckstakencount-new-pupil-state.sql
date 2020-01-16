ALTER VIEW [mtc_admin].[vewPupilLiveChecksTakenCount] AS

    SELECT
        p.id as pupil_id,
        p.foreName,
        p.middleNames,
        p.lastName,
        p.dateOfBirth,
        p.urlSlug,
        p.school_id,
        count(*) as totalCheckCount
    FROM
        [mtc_admin].[pupil] p
            INNER JOIN [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id)
            INNER JOIN [mtc_admin].[checkStatus] AS chkStatus ON (chk.checkStatus_id = chkStatus.id)
    WHERE
             -- ignore pupils who are not attending
             p.attendanceId IS NULL
             -- pupils must have already attempted 1 or more checks that are not expired
      AND    chk.pupilLoginDate IS NOT NULL
      AND    chkStatus.code <> 'EXP'
      AND    chk.isLiveCheck = 1
    GROUP BY
        p.id,
        p.foreName,
        p.middleNames,
        p.lastName,
        p.dateOfBirth,
        p.urlSlug,
        p.school_id
;
