DROP INDEX [mtc_admin].pupil.pupil_school_id_pin_uindex;
ALTER TABLE mtc_admin.pupil ALTER COLUMN pin SMALLINT;
CREATE UNIQUE INDEX pupil_school_id_pin_uindex ON [mtc_admin].pupil (school_id, pin) WHERE pin IS NOT NULL;
