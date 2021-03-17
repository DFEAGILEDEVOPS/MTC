ALTER TABLE mtc_results.psychometricReport
    ALTER COLUMN DOB DROP MASKED;

ALTER TABLE mtc_results.psychometricReport
    ALTER COLUMN Gender DROP MASKED;

ALTER TABLE mtc_results.psychometricReport
    ALTER COLUMN Forename DROP MASKED;

ALTER TABLE mtc_results.psychometricReport
    ALTER COLUMN Surname DROP MASKED;

ALTER TABLE mtc_results.psychometricReport
    ALTER COLUMN FormMark DROP MASKED;

-- PupilId is the UPN here
ALTER TABLE mtc_results.psychometricReport
    ALTER COLUMN PupilId DROP MASKED;

ALTER TABLE mtc_results.checkResult
    ALTER COLUMN [mark] DROP MASKED;
