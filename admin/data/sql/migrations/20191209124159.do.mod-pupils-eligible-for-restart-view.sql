ALTER VIEW [mtc_admin].[vewPupilsEligibleForRestart] AS

SELECT
    p.id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    p.urlSlug,
    p.school_id,
    p.group_id,
    count(*) as totalCheckCount
FROM
    [mtc_admin].[pupil] p
        LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (p.id = pa.pupil_id and pa.isDeleted = 0)
        INNER JOIN [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id)
WHERE
  -- don’t select pupils who are not attending
    pa.id IS NULL
  -- pupils must have already attempted 1 or more checks that they logged in to
  AND   chk.pupilLoginDate IS NOT NULL
  AND   chk.isLiveCheck = 1
  AND   p.id NOT IN (
    -- remove pupils with unconsumed restarts
    SELECT
        p2.id
    FROM
        [mtc_admin].[pupil] p2
            LEFT JOIN [mtc_admin].[pupilRestart] pr2 ON (p2.id = pr2.pupil_id and pr2.isDeleted = 0)
    WHERE
        (pr2.id IS NOT NULL AND pr2.check_id IS NULL)
)
GROUP BY
    p.id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    p.urlSlug,
    p.school_id,
    p.group_id
;
