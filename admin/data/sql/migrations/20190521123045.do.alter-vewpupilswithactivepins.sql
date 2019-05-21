ALTER VIEW [mtc_admin].[vewPupilsWithActivePins] AS
    -- include live checks that are either new or collected
    -- or familiarisation checks that are either new, collected or started
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
         g.group_id,
         chk.checkCode
  FROM [mtc_admin].[pupil] p
         INNER JOIN [mtc_admin].[school] s ON (p.school_id = s.id)
         LEFT JOIN  [mtc_admin].[pupilGroup] g ON (g.pupil_id = p.id)
         INNER JOIN [mtc_admin].[check] chk ON (chk.pupil_id = p.id)
         INNER JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
         INNER JOIN [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
         INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
  WHERE  cp.pinExpiresAt > GETUTCDATE()
    AND  (
      (chk.isLiveCheck = 1 AND chkStatus.code IN ('COL', 'NEW')) OR
      (chk.isLiveCheck = 0 AND chkStatus.code IN ('COL', 'NEW', 'STD'))
    )
;
