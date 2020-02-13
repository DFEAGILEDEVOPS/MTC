SELECT COUNT(*) as [TotalChecks], 
COUNT(CASE WHEN received=0 THEN 1 END) AS [NotReceived], 
COUNT(CASE WHEN received=1 THEN 1 END) AS [Received],
COUNT(CASE WHEN complete=0 THEN 1 END) AS [Incomplete],
COUNT(CASE WHEN complete=1 THEN 1 END) AS [Complete]
FROM mtc_admin.[check] 