DROP INDEX mtc_admin.school.school_dfeNumber_uindex
ALTER TABLE mtc_admin.school ALTER COLUMN dfeNumber NVARCHAR(20) NOT NULL
CREATE UNIQUE INDEX school_dfeNumber_uindex ON mtc_admin.school (dfeNumber)
