
ALTER TABLE mtc_admin.hdf
ALTER COLUMN fullName ADD MASKED WITH (FUNCTION = 'default()')
