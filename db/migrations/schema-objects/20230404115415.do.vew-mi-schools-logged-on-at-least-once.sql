CREATE OR ALTER VIEW mtc_admin.[vewMiSchoolsLoggedOnAtLeastOnce] AS
  SELECT COUNT(DISTINCT ale.urn) as [numberOfSchoolsAccessedService]
    FROM [mtc_admin].[adminLogonEvent] ale
    WHERE ale.mtcRole = 'TEACHER'
