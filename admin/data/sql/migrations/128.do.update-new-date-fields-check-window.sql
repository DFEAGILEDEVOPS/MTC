UPDATE mtc_admin.checkWindow SET adminEndDate = DATEADD(day, 10, adminStartDate), familiarisationCheckStartDate = DATEADD(day, 2, adminStartDate), familiarisationCheckEndDate = checkEndDate
