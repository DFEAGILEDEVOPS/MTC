ALTER TABLE mtc_results.psychometricReport ADD ReasonNotTakingCheckNumber INT;
GO

-- data migration
UPDATE mtc_results.psychometricReport
   SET psychometricReport.ReasonNotTakingCheckNumber = ( CASE
       WHEN ReasonNotTakingCheck = 'Z' THEN 1
       WHEN ReasonNotTakingCheck = 'A' THEN 2
       WHEN ReasonNotTakingCheck = 'L' THEN 3
       WHEN ReasonNotTakingCheck = 'U' THEN 4
       WHEN ReasonNotTakingCheck = 'B' THEN 5
       WHEN ReasonNotTakingCheck = 'J' THEN 6
       ELSE NULL
       END );
GO

-- drop old col
ALTER TABLE mtc_results.psychometricReport DROP COLUMN ReasonNotTakingCheck;
GO

-- rename new col
EXEC sp_rename 'mtc_results.psychometricReport.ReasonNotTakingCheckNumber', 'ReasonNotTakingCheck', 'COLUMN';
