
ALTER TABLE mtc_admin.psychometricianReportCache
ALTER COLUMN jsonData ADD MASKED WITH (FUNCTION = 'default()')
