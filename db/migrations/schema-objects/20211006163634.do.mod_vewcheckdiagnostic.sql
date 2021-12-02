CREATE OR ALTER VIEW [mtc_admin].[vewCheckDiagnostic]
AS
SELECT
    c.id AS check_id,
    c.createdAt,
    c.checkCode,
    c.pupil_id,
    c.pupilLoginDate,
    c.receivedByServerAt,
    c.isLiveCheck,
    c.received as checkReceived,
    c.complete as checkComplete,
    c.completedAt as checkCompletedAt,
    c.processingFailed as checkProcessingFailed,
    p.foreName,
    p.lastName,
    p.currentCheckId,
    p.checkComplete as pupilCheckComplete,
    p.restartAvailable,
    p.attendanceId,
    s.id AS school_id,
    s.dfeNumber,
    s.name AS school_name,
    s.pin AS school_pin,
    pin.val AS pupil_pin,
    cp.pinExpiresAt,
    IIF(cp.pinExpiresAt IS NULL OR cp.pinExpiresAt < GETUTCDATE(), 'Y', 'N') pinHasExpired
  FROM [mtc_admin].[check] c
       JOIN [mtc_admin].[pupil] p ON (c.pupil_id = p.id)
       JOIN [mtc_admin].[school] s ON (p.school_id = s.id)
       LEFT JOIN [mtc_admin].[checkPin] cp ON (c.id = cp.check_id)
       LEFT JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
;
