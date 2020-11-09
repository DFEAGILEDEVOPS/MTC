CREATE VIEW [mtc_admin].[vewCheckWindowsWithStatusAndFormCountByType] AS
  SELECT
    cw.urlSlug,
    cw.name,
    cw.createdAt,
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
     ) AS [status],
    SUM(
      CASE
      WHEN cf.isLiveCheckForm = 0 THEN 1 ELSE 0 END
    ) AS FamiliarisationCheckFormCount,
    SUM(
      CASE
      WHEN cf.isLiveCheckForm = 1 THEN 1 ELSE 0 END
    ) AS LiveCheckFormCount
  FROM [mtc_admin].checkWindow cw
  LEFT JOIN [mtc_admin].checkFormWindow cfw
    ON cw.id = cfw.checkWindow_id
  LEFT JOIN [mtc_admin].checkForm cf
    ON cf.id = cfw.checkForm_id
  GROUP BY
    cw.urlSlug,
    cw.name,
    cw.createdAt,
    cw.isDeleted,
    cw.checkStartDate,
    cw.checkEndDate,
    cw.adminStartDate,
    cw.adminEndDate,
    cw.familiarisationCheckStartDate,
    cw.familiarisationCheckEndDate
