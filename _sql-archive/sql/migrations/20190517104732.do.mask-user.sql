
ALTER TABLE mtc_admin.[user]
ALTER COLUMN displayName ADD MASKED WITH (FUNCTION = 'default()')
ALTER TABLE mtc_admin.[user]
ALTER COLUMN identifier ADD MASKED WITH (FUNCTION = 'default()')
