ALTER VIEW [mtc_admin].[vewPupilRegister] AS
SELECT
    p.id as pupilId,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.urlSlug,
    p.dateOfBirth,
    p.upn,
    p.school_id,
    p.group_id,
    p.checkComplete as pupilCheckComplete,
    ISNULL(g.name, '-') as groupName,
    p.currentCheckId,
    p.attendanceId,
    c.complete as checkComplete,
    c.received as checkReceived,
    cs.code as checkStatusCode,
    p.restartAvailable,
    c.pupilLoginDate,
    cp.pinExpiresAt

FROM
    [mtc_admin].[pupil] p LEFT JOIN
    [mtc_admin].[group] g ON (p.group_id = g.id) LEFT JOIN
    [mtc_admin].[check] c ON (p.currentCheckId = c.id) LEFT JOIN
    [mtc_admin].[checkStatus] cs ON (c.checkStatus_id = cs.id) LEFT JOIN
    [mtc_admin].[checkPin] cp ON (c.id = cp.check_id)
;
