CREATE OR ALTER VIEW mtc_admin.[vewMiChecksNotStarted] AS
  SELECT COUNT(chk.id) as [numberOfChecksNotStarted]
    FROM [mtc_admin].[check] chk
    WHERE chk.startedAt IS NULL AND chk.isLiveCheck = 1
