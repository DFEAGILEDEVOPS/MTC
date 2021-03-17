ALTER TABLE mtc_results.psychometricReport
    ALTER COLUMN DOB ADD MASKED WITH (FUNCTION = 'default()');

ALTER TABLE mtc_results.psychometricReport
    ALTER COLUMN Gender ADD MASKED WITH (FUNCTION = 'default()');

ALTER TABLE mtc_results.psychometricReport
    ALTER COLUMN Forename ADD MASKED WITH (FUNCTION = 'default()');

ALTER TABLE mtc_results.psychometricReport
    ALTER COLUMN Surname ADD MASKED WITH (FUNCTION = 'default()');

ALTER TABLE mtc_results.psychometricReport
    ALTER COLUMN FormMark ADD MASKED WITH (FUNCTION = 'default()');

-- PupilId is the UPN here
ALTER TABLE mtc_results.psychometricReport
    ALTER COLUMN PupilId ADD MASKED WITH (FUNCTION = 'default()');

ALTER TABLE mtc_results.checkResult
    ALTER COLUMN [mark] ADD MASKED WITH (FUNCTION = 'default()');
