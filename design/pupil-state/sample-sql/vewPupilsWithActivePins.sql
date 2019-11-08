-- This is only called from preparedCheckSyncService.addMessages
-- which passes a URL slug - this ought to be a pupil reference as the intention is to
-- update all the config for any current live or try it out checks.

CREATE VIEW [mtc_admin].[vewPupilsWithActivePins] AS
    -- include live checks that are either new or collected
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
             INNER JOIN [mtc_admin].[school] s ON (p.school_id = s.id)
             INNER JOIN [mtc_admin].[check] chk ON (chk.pupil_id = p.id)
             INNER JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
             INNER JOIN [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
             INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
    WHERE  cp.pinExpiresAt > GETUTCDATE()
      AND  (chkStatus.code = 'NEW' OR chkStatus.code = 'COL')
      AND  chk.isLiveCheck = 1

    UNION
    -- include familiarisation checks that are either new, collected or started
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
             INNER JOIN [mtc_admin].[school] s ON (p.school_id = s.id)
             INNER JOIN [mtc_admin].[check] chk ON (chk.pupil_id = p.id)
             INNER JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
             INNER JOIN [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
             INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
    WHERE  cp.pinExpiresAt > GETUTCDATE()
      AND  (chkStatus.code = 'NEW' OR chkStatus.code = 'COL' OR chkStatus.code = 'STD')
      AND  chk.isLiveCheck = 0
go

-- Alternative

CREATE VIEW [mtc_admin].[vewPupilsWithActivePins] AS
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
    LEFT JOIN [mtc_admin].[check] chk ON (chk.pupil_id = p.id)
    LEFT JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chk.id)
    INNER JOIN [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
    INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)

    WHERE
        cp.pinExpiresAt > GETUTCDATE()
    AND (
            (
                    (chkStatus.code = 'NEW' OR chkStatus.code = 'COL')
                    AND chk.isLiveCheck = 1
            )

            OR

            (
                (chkStatus.code = 'NEW' OR chkStatus.code = 'COL' OR chkStatus.code = 'STD')
                AND  chk.isLiveCheck = 0
            )
    )
    AND p.id = 1 -- whatever

