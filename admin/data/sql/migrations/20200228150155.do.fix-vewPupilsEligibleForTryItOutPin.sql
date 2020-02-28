CREATE OR ALTER VIEW [mtc_admin].[vewPupilsEligibleForTryItOutPin]
AS
  SELECT
    p.id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.foreNameAlias,
    p.lastNameAlias,
    p.dateOfBirth,
    p.school_id,
    p.group_id,
    p.urlSlug,
    p.upn
  FROM
    [mtc_admin].[pupil] p
    LEFT JOIN [mtc_admin].[check] c ON (p.currentCheckId = c.id)
    LEFT JOIN [mtc_admin].[checkStatus] cs ON (c.checkStatus_id = cs.id)
  WHERE
      -- don't allow a try it out check for anyone who has left
      p.attendanceId IS NULL
    -- and exclude anyone who has a check that is not new
    AND (
        p.currentCheckId IS NULL
    OR
    (p.currentCheckId IS NOT NULL AND c.pupilLoginDate IS NULL)
      )
    -- exclude pupils who already have an active familiarisation check
    AND p.id NOT IN (
        SELECT p2.id
    FROM
      [mtc_admin].[pupil] p2
      LEFT JOIN [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id)
      LEFT JOIN [mtc_admin].[checkStatus] AS chkStatus ON (chk.checkStatus_id = chkStatus.id)
      LEFT JOIN [mtc_admin].[checkPin] cp ON (c.id = cp.check_id)
    WHERE chk.isLiveCheck = 0
      AND chkStatus.code IN ('NEW', 'COL')
      AND p2.school_id = p.school_id
      AND cp.pinExpiresAt > GETUTCDATE()
      )
