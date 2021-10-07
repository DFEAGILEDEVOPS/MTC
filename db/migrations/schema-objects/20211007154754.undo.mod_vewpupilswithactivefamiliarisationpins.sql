CREATE OR ALTER VIEW [mtc_admin].[vewPupilsWithActiveFamiliarisationPins]
AS
SELECT
    p.id,
    p.foreName,
    p.lastName,
    p.middleNames,
    p.foreNameAlias,
    p.lastNameAlias,
    p.dateOfBirth,
    p.urlSlug,
    p.upn,
    p.school_id,
    pin.val as pin,
    cp.pinExpiresAt,
    p.group_id
  FROM [mtc_admin].[pupil] p
       INNER JOIN [mtc_admin].[school] s ON (p.school_id = s.id)
       INNER JOIN [mtc_admin].[check] chk ON (chk.pupil_id = p.id)
       INNER JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
       INNER JOIN [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
       INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
 WHERE cp.pinExpiresAt > GETUTCDATE()
   AND chkStatus.code IN ('NEW', 'COL')
   -- make sure we only select familiarisation checks
   AND chk.isLiveCheck = 0
   -- don't include pupils who are not taking the check
   AND p.attendanceId IS NULL
;
