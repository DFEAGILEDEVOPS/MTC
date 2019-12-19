ALTER VIEW [mtc_admin].[vewPupilsEligibleForLivePinGeneration] AS
    SELECT p.id,
           p.foreName,
           p.middleNames,
           p.lastName,
           p.foreNameAlias,
           p.lastNameAlias,
           p.dateOfBirth,
           p.urlSlug,
           p.upn,
           p.school_id,
           p.group_id,
           -- diagnostic fields
           cp.pinExpiresAt,
           p.currentCheckId
    FROM [mtc_admin].[pupil] p LEFT JOIN
         [mtc_admin].[check] c ON (p.currentCheckId = c.id) LEFT JOIN
         -- We could avoid this join by moving pinExpiresAt to the check (along with the proposed field `pinValidFrom`)
         [mtc_admin].[checkPin] cp ON (c.id = cp.check_id)
    WHERE p.attendanceId IS NULL
      AND (
            -- no check has ever been allocated
            p.currentCheckId IS NULL
            OR
            p.restartAvailable = 1
            OR
            (
                -- the check was assigned but then expired
                p.currentCheckId IS NOT NULL
                AND (cp.pinExpiresAt IS NULL OR SYSDATETIMEOFFSET() > cp.pinExpiresAt)
                AND c.pupilLoginDate IS NULL -- the check must be pristine
            )
        )
;
