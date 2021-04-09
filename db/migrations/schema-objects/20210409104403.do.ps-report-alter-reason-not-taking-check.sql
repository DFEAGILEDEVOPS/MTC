ALTER TABLE mtc_results.psychometricReport ADD ReasonNotTakingCheckCode CHAR(1);
GO

-- data migration
UPDATE mtc_results.psychometricReport
SET psychometricReport.ReasonNotTakingCheckCode = ( CASE
    WHEN ReasonNotTakingCheck = 1 THEN 'Z'
    WHEN ReasonNotTakingCheck = 2 THEN 'A'
    WHEN ReasonNotTakingCheck = 3 THEN 'L'
    WHEN ReasonNotTakingCheck = 4 THEN 'U'
    WHEN ReasonNotTakingCheck = 5 THEN 'B'
    WHEN ReasonNotTakingCheck = 6 THEN 'J'
    ELSE NULL
    END );
GO

-- drop old col
ALTER TABLE mtc_results.psychometricReport DROP COLUMN ReasonNotTakingCheck;
GO

-- rename new col
EXEC sp_rename 'mtc_results.psychometricReport.ReasonNotTakingCheckCode', 'ReasonNotTakingCheck', 'COLUMN';
