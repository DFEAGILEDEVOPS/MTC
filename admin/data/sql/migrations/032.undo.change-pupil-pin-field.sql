DROP INDEX mtc_admin.pupil.pupil_school_id_pin_uindex;
ALTER TABLE [mtc_admin].[pupil] ALTER COLUMN pin char(5);
UPDATE [mtc_admin].[pupil] SET pin='9999a' WHERE pin='9999' AND isTestAccount=1;
UPDATE [mtc_admin].[pupil] SET pin='8888a' WHERE pin='8888' AND isTestAccount=1;
CREATE UNIQUE INDEX pupil_pin_uindex ON [mtc_admin].pupil (pin) WHERE pin IS NOT NULL;
