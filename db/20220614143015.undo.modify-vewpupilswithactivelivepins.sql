DROP VIEW IF EXISTS [mtc_admin].[vewPupilsWithActiveLivePins]

CREATE VIEW [mtc_admin].[vewPupilsWithActiveLivePins]
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
       INNER JOIN [mtc_admin].[check] chk ON (p.currentCheckId = chk.id)
       INNER JOIN [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
       INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
 WHERE
   -- pin is present and valid
     cp.pinExpiresAt > GETUTCDATE()
   AND chk.isLiveCheck = 1
   -- check is pristine
   AND chk.pupilLoginDate IS NULL
   AND p.attendanceId IS NULL
   AND p.currentCheckId IS NOT NULL
;
