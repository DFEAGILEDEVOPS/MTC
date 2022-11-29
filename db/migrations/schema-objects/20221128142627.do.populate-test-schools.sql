-- SET the isTestSchool flag
-- this affects prod and pre-prod test schools (as these environments have existing data).
-- Note that for local dev, where migrations and *then* seed data is inserted, this will
-- do precisely nothing, as the school table is empty when the migrations run.
UPDATE mtc_admin.school
SET isTestSchool = 1
WHERE leaCode = 999;
