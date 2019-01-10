ALTER VIEW [mtc_admin].vewCheckWindowWithStatus AS
SELECT
  cw.urlSlug,
  cw.name,
  cw.isDeleted,
  cw.checkStartDate,
  cw.checkEndDate,
  cw.familiarisationCheckStartDate,
  cw.familiarisationCheckEndDate,
  CAST(
    CASE
        WHEN GETUTCDATE() < cw.adminStartDate THEN 'Inactive'
        WHEN GETUTCDATE() >= cw.adminStartDate AND GETUTCDATE() <= cw.adminEndDate THEN 'Active'
        ELSE 'Past'
    END AS NVARCHAR(50)
   ) AS [status]
FROM [mtc_admin].checkWindow cw
