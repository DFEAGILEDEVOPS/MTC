CREATE OR ALTER VIEW [mtc_admin].[vewPupilStatus]
AS
(
SELECT
    p.id,
    p.foreName,
    p.lastName,
    p.middleNames,
    p.dateOfBirth,
    p.group_id,
    p.urlSlug,
    p.school_id,
    ac.reason,
    ac.code as reasonCode,
    -- the following fields are required to produce the pupil status
    p.attendanceId,
    p.checkComplete as pupilCheckComplete,
    p.currentCheckId,
    p.id as pupilId,
    p.restartAvailable,
    chk.received as checkReceived,
    chk.complete as checkComplete,
    chk.processingFailed,
    chk.pupilLoginDate,
    cp.pinExpiresAt,
    chk.startedAt as checkStartedAt
FROM [mtc_admin].[pupil] p
     LEFT JOIN [mtc_admin].[check] chk ON (p.currentCheckId = chk.id)
     LEFT JOIN [mtc_admin].[attendanceCode] ac ON (p.attendanceId = ac.id)
     LEFT JOIN [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id) )
;
