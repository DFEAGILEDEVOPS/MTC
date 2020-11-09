UPDATE mtc_admin.checkWindow
SET    adminEndDate = DATEADD(day, 2, checkEndDate),
       familiarisationCheckStartDate = DATEADD(day, -1, checkStartDate),
       familiarisationCheckEndDate = checkEndDate
