UPDATE [mtc_admin].[pupil] SET pin='9999' WHERE pin='9999a' AND isTestAccount=1;
UPDATE [mtc_admin].[pupil] SET pin='8888' WHERE pin='8888a' AND isTestAccount=1;
DROP INDEX mtc_admin.pupil.pupil_pin_uindex;
ALTER TABLE [mtc_admin].[pupil] ALTER COLUMN pin smallint;
CREATE UNIQUE INDEX pupil_pin_uindex ON [mtc_admin].pupil (pin) WHERE pin IS NOT NULL;
