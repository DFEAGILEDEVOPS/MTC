CREATE OR ALTER VIEW [mtc_admin].[vewPupilsWithActivePins] AS
SELECT
    p.id,
    p.foreName,
    p.lastName,
    p.middleNames,
    p.dateOfBirth,
    p.urlSlug,
    p.school_id,
    pin.val as pin,
    cp.pinExpiresAt,
    p.group_id,
    chk.checkCode
  FROM [mtc_admin].[pupil] p
       INNER JOIN [mtc_admin].[check] chk ON (chk.pupil_id = p.id)
       INNER JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
       INNER JOIN [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
       INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
 WHERE
         cp.pinExpiresAt > GETUTCDATE()
   AND  chkStatus.code = 'NEW'
   AND  chk.pupilLoginDate IS NULL
;
