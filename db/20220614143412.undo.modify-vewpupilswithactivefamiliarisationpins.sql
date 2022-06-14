DROP VIEW IF EXISTS [mtc_admin].[vewPupilsWithActiveFamiliarisationPins]

CREATE VIEW [mtc_admin].[vewPupilsWithActiveFamiliarisationPins]
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
       INNER JOIN [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
       INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
 WHERE
   -- the pin must be present and valid
     cp.pinExpiresAt > GETUTCDATE()
   -- make sure we only select familiarisation checks
   AND chk.isLiveCheck = 0
   -- don't include pupils who are not taking the check
   AND p.attendanceId IS NULL
;
