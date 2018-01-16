CREATE VIEW [mtc_admin].[vewCheckWindowsWithFormCount] AS
SELECT cw.id, cw.name, 
cw.adminStartDate, cw.checkStartDate, cw.checkEndDate, 
cw.isDeleted, COUNT(mtc_admin.checkFormWindow.checkWindow_id) AS FormCount
FROM mtc_admin.checkWindow cw LEFT OUTER JOIN
 mtc_admin.checkFormWindow ON cw.id = mtc_admin.checkFormWindow.checkWindow_id
GROUP BY cw.id, cw.name, cw.adminStartDate, 
cw.checkStartDate, cw.checkEndDate, cw.isDeleted
