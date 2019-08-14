CREATE VIEW [mtc_admin].[vewPupilRegisterV2_Preview] AS
    SELECT
     p.id as pupilId,
         p.foreName,
         p.middleNames,
         p.lastName,
         p.urlSlug,
         p.dateOfBirth,
         p.school_id,
         g.id as groupId,
         ISNULL(g.name, '-') as groupName,
         ps.code as pupilStatusCode,
         s.check_id as lastCheckId,
         cs.code as lastCheckStatusCode,
         s.restart_id as pupilRestartId,
         pr.check_id as pupilRestartCheckId

  FROM
    [mtc_admin].[pupil] p
        INNER JOIN [mtc_admin].[pupilStatus] ps
            ON p.pupilStatus_id = ps.id
        LEFT JOIN [mtc_admin].[group] g
            ON p.group_id = g.id
        LEFT JOIN [mtc_admin].[pupilState] s
            ON s.pupil_id = p.id
        INNER JOIN [mtc_admin].[check] c
            ON s.check_id = c.id
        INNER JOIN [mtc_admin].[checkStatus] cs
            ON c.checkStatus_id = cs.id
        INNER JOIN [mtc_admin].[pupilRestart] pr
            ON s.restart_id = pr.id
