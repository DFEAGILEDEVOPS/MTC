ALTER TABLE
    mtc_results.checkResult ALTER COLUMN mark ADD MASKED WITH (FUNCTION = 'random(99, 99)');
