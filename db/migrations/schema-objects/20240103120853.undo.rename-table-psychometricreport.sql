IF EXISTS(SELECT *
            FROM INFORMATION_SCHEMA.TABLES
           WHERE TABLE_NAME = 'psychometricReport_2023'
             AND TABLE_SCHEMA = 'mtc_results')
BEGIN
    EXEC sp_rename 'mtc_results.psychometricReport_2023', 'psychometricReport'
END
