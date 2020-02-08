-- helper view for DBAs / developers

CREATE OR ALTER VIEW [mtc_admin].[vewPupilStatus]
AS
(
SELECT p.id AS pupil_id, p.foreName, p.lastName, p.middleNames, p.dateOfBirth, p.gender
FROM [mtc_admin].[pupil] p )
