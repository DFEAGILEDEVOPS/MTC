-- helper view for DBAs / developers

CREATE OR ALTER VIEW [mtc_admin].[vewPupilStatus]
AS
(
SELECT
    p.id AS pupil_id,
    ac.code AS attendanceCode,
    p.foreName,
    p.lastName,
    p.middleNames,
    p.dateOfBirth,
    p.gender,
    p.school_id,
    p.checkComplete,
    c.checkCode AS currentCheckCode,
    cs.code AS currentCheckStatusCode
FROM [mtc_admin].[pupil] p
     LEFT JOIN [mtc_admin].[check] c ON (p.currentCheckId = c.id)
     LEFT JOIN [mtc_admin].[checkStatus] cs ON (c.checkStatus_id = cs.id)
     LEFT JOIN [mtc_admin].[attendanceCode] ac ON (p.attendanceId = ac.id) );
