ALTER TABLE mtc_admin.pupilAudit
    ALTER COLUMN newData ADD MASKED WITH (FUNCTION = 'default()');
