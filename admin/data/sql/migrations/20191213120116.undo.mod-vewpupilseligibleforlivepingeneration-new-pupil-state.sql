ALTER VIEW [mtc_admin].[vewPupilsEligibleForLivePinGeneration] AS
    SELECT
        p.id,
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
        IIF(lastPupilRestart.id IS NOT NULL, CAST (1 as bit), CAST (0 as bit)) as isRestart,
        lastPupilRestart.id as pupilRestart_id
    FROM
        [mtc_admin].[pupil] p JOIN
        [mtc_admin].[pupilStatus] ps ON (p.pupilStatus_id = ps.id) LEFT JOIN
        (
            SELECT *,
                   ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY id DESC) as rank
            FROM [mtc_admin].[pupilRestart]
            WHERE isDeleted = 0
        ) lastPupilRestart ON (p.id = lastPupilRestart.pupil_id)
    WHERE
            ps.code = 'UNALLOC'
      AND (lastPupilRestart.rank = 1 OR lastPupilRestart.rank IS NULL)
;
