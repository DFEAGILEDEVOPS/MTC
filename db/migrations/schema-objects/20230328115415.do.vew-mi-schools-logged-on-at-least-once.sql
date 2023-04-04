CREATE OR ALTER VIEW mtc_admin.[vewMiSchoolsLoggedOnAtLeastOnce] AS
  SELECT COUNT(DISTINCT sle.urn) as [numberOfSchoolsAccessedService]
    FROM [mtc_admin].[vewMiSchoolLogonEvents] sle
    WHERE sle.role = 'TEACHER'
