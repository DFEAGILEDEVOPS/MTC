CREATE OR ALTER VIEW mtc_admin.[vewMiChecksWithErrors] AS
  SELECT COUNT(chk.id) as [numberOfChecksWithErrors]
    FROM [mtc_admin].[check] chk
    WHERE chk.processingFailed = 1
