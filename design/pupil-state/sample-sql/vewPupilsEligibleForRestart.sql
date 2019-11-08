CREATE VIEW [mtc_admin].[vewPupilsEligibleForRestart] AS

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
    INNER JOIN [mtc_admin].[check] AS chk ON (p.currentCheckId = chk.pupil_id)
    INNER JOIN [mtc_admin].[checkStatus] AS chkStatus ON (chk.checkStatus_id = chkStatus.id)
WHERE
  -- don’t select pupils who are not attending
    p.attendanceId IS NULL

  -- pupils must have already attempted 1 or more checks that are started, complete, not received
  AND   p.currentCheckId IS NOT NULL
  AND   chkStatus.code IN ('COL', 'STD', 'CMP', 'NTR') -- would allow from pupil login

--   AND   p.id NOT IN (
--     -- remove pupils with unconsumed restarts
--     SELECT
--         p2.id
--     FROM
--         [mtc_admin].[pupil] p2
--             LEFT JOIN [mtc_admin].[pupilRestart] pr2 ON (p2.id = pr2.pupil_id and pr2.isDeleted = 0)
--     WHERE
--         (pr2.id IS NOT NULL AND pr2.check_id IS NULL)
-- )
AND p.restartAvailable IS NOT NULL -- no unconsumed restarts
GROUP BY
    p.id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    p.urlSlug,
    p.school_id,
    p.group_id

go

