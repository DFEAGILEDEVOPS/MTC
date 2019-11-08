CREATE VIEW [mtc_admin].vewPupilsEligibleForLivePinGeneration AS
SELECT
    p.id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    p.urlSlug,
    p.school_id,
    p.group_id
--     IIF(lastPupilRestart.id IS NOT NULL, CAST (1 as bit), CAST (0 as bit)) as isRestart, -- would have to see why the app needs these fields
--     lastPupilRestart.id as pupilRestart_id
FROM
    [mtc_admin].[pupil]
WHERE
  (
      p.currentCheckId is NULL AND p.attendanceId IS NULL -- initial pupil state - no checks taken so far
      OR
      p.restartAvailable = true -- restart available, so we don't care about the previous check
  )
go


