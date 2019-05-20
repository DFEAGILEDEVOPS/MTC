
ALTER TABLE mtc_admin.[pupil]
ALTER COLUMN foreName ADD MASKED WITH (FUNCTION = 'default()')
ALTER TABLE mtc_admin.[pupil]
ALTER COLUMN middleNames ADD MASKED WITH (FUNCTION = 'default()')
ALTER TABLE mtc_admin.[pupil]
ALTER COLUMN lastName ADD MASKED WITH (FUNCTION = 'default()')
ALTER TABLE mtc_admin.[pupil]
ALTER COLUMN dateOfBirth ADD MASKED WITH (FUNCTION = 'default()')
ALTER TABLE mtc_admin.[pupil]
ALTER COLUMN upn ADD MASKED WITH (FUNCTION = 'default()')
