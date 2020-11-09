CREATE UNIQUE INDEX school_urlSlug_uindex ON [mtc_admin].school (urlSlug);
CREATE UNIQUE INDEX school_pin_uindex ON [mtc_admin].school (pin) WHERE pin IS NOT NULL;
CREATE UNIQUE INDEX pupil_pin_uindex ON [mtc_admin].pupil (pin) WHERE pin IS NOT NULL;
