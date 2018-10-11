CREATE VIEW [mtc_admin].vewCheckWindowWithStatus
AS SELECT cw.name, CAST(
    CASE
        WHEN GETUTCDATE() < cw.checkStartDate THEN 'Inactive'
        WHEN GETUTCDATE() >= cw.checkStartDate AND GETUTCDATE() <= cw.checkEndDate THEN 'Active'
        ELSE 'Past'
    END AS NVARCHAR(50)
   ) AS [status]
FROM mtc.mtc_admin.checkWindow cw
