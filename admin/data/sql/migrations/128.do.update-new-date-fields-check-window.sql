UPDATE mtc_admin.checkwindow
SET    adminenddate = Dateadd(day, 10, adminstartdate),
       familiarisationcheckstartdate = Dateadd(day, 2, adminstartdate),
       familiarisationcheckenddate = checkenddate
