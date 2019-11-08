CREATE VIEW [mtc_admin].[vewPupilRegister] AS
SELECT
    p.id as pupilId,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.urlSlug,
    p.dateOfBirth,
    p.school_id,
    p.group_id,
    ISNULL(g.name, '-') as groupName,
--    ps.code as pupilStatusCode,
--    lastCheck.id as lastCheckId,
--    cs.code as lastCheckStatusCode,
--    lastPupilRestart.id as pupilRestartId,
--    lastPupilRestart.check_id as pupilRestartCheckId

-- status columns
    p.currentCheckId,
    p.checkComplete,
    p.restartAvailable,
    p.attendanceId

FROM
    [mtc_admin].[pupil] p LEFT JOIN
    [mtc_admin].[group] g ON (p.group_id = g.id)
WHERE
    p.school_id = 5
go

