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
    [mtc_admin].[pupil] p INNER JOIN
    [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id) INNER JOIN
    [mtc_admin].[check] as currentCheck ON (p.currentCheckId = currentCheck.id)
WHERE
  -- don’t select pupils who are not attending
    p.attendanceId IS NULL
  -- remove unconsumed restarts
  AND   p.restartAvailable = 0
  -- pupils must have already logged in on the current check
  AND   currentCheck.pupilLoginDate IS NOT NULL
  -- for the count they must be live checks
  AND   chk.isLiveCheck = 1
  -- exclude expired checks, ensure the pupil logged in to the check
  AND   chk.pupilLoginDate IS NOT NULL
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

