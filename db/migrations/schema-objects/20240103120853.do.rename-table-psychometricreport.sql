IF EXISTS(SELECT *
            FROM INFORMATION_SCHEMA.TABLES
           WHERE TABLE_NAME = 'psychometricReport'
             AND TABLE_SCHEMA = 'mtc_results')
BEGIN
    EXEC sp_rename 'mtc_results.psychometricReport', 'psychometricReport_2023'
END
