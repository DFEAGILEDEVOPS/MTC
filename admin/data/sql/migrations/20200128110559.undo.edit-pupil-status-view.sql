CREATE OR ALTER VIEW [mtc_admin].[vewPupilStatus] AS (
      SELECT
              p.id as pupil_id,
              p.foreName,
              p.lastName,
              p.middleNames,
              p.dateOfBirth,
              p.gender,
              ps.code
      FROM    [mtc_admin].[pupil] p
              LEFT JOIN [mtc_admin].[pupilStatus] ps ON (p.pupilStatus_id = ps.id)
);
