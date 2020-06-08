ALTER VIEW [mtc_admin].[vewCheckDiagnostic]
AS
SELECT
    c.id AS check_id,
    c.createdAt,
    c.checkCode,
    c.pupil_id,
    p.foreName,
    p.lastName,
    s.id AS school_id,
    s.dfeNumber,
    s.name AS school_name,
    s.pin AS school_pin,
    c.pupilLoginDate,
    c.startedAt,
    c.receivedByServerAt,
    c.isLiveCheck,
    cs.code AS check_status,
    cs.description AS check_desc,
    pin.val AS pupil_pin,
    cp.pinExpiresAt,
    IIF(cp.pinExpiresAt IS NULL OR cp.pinExpiresAt < GETUTCDATE(), 'Y', 'N') pinHasExpired
  FROM [mtc_admin].[check] c
       JOIN [mtc_admin].[checkStatus] cs ON (c.checkStatus_id = cs.id)
       JOIN [mtc_admin].[pupil] p ON (c.pupil_id = p.id)
       JOIN [mtc_admin].[school] s ON (p.school_id = s.id)
       LEFT JOIN [mtc_admin].[checkPin] cp ON (c.id = cp.check_id)
       LEFT JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
