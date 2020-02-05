IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAccessArrangements]') AND NAME ='idx_pupilAccessArrangements_questionReaderReasons_id')
BEGIN
    DROP INDEX idx_pupilAccessArrangements_questionReaderReasons_id ON mtc_admin.[pupilAccessArrangements];
END
CREATE INDEX idx_pupilAccessArrangements_questionReaderReasons_id ON mtc_admin.[pupilAccessArrangements] (questionReaderReasons_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAccessArrangements]') AND NAME ='idx_pupilAccessArrangements_pupil_id')
BEGIN
    DROP INDEX idx_pupilAccessArrangements_pupil_id ON mtc_admin.[pupilAccessArrangements];
END
CREATE INDEX idx_pupilAccessArrangements_pupil_id ON mtc_admin.[pupilAccessArrangements] (pupil_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAccessArrangements]') AND NAME ='idx_pupilAccessArrangements_recordedBy_user_id')
BEGIN
    DROP INDEX idx_pupilAccessArrangements_recordedBy_user_id ON mtc_admin.[pupilAccessArrangements];
END
CREATE INDEX idx_pupilAccessArrangements_recordedBy_user_id ON mtc_admin.[pupilAccessArrangements] (recordedBy_user_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAccessArrangements]') AND NAME ='idx_pupilAccessArrangements_accessArrangements_id')
BEGIN
    DROP INDEX idx_pupilAccessArrangements_accessArrangements_id ON mtc_admin.[pupilAccessArrangements];
END
CREATE INDEX idx_pupilAccessArrangements_accessArrangements_id ON mtc_admin.[pupilAccessArrangements] (accessArrangements_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAccessArrangements]') AND NAME ='idx_pupilAccessArrangements_pupilFontSizes_id')
BEGIN
    DROP INDEX idx_pupilAccessArrangements_pupilFontSizes_id ON mtc_admin.[pupilAccessArrangements];
END
CREATE INDEX idx_pupilAccessArrangements_pupilFontSizes_id ON mtc_admin.[pupilAccessArrangements] (pupilFontSizes_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAccessArrangements]') AND NAME ='idx_pupilAccessArrangements_pupilColourContrasts_id')
BEGIN
    DROP INDEX idx_pupilAccessArrangements_pupilColourContrasts_id ON mtc_admin.[pupilAccessArrangements];
END
CREATE INDEX idx_pupilAccessArrangements_pupilColourContrasts_id ON mtc_admin.[pupilAccessArrangements] (pupilColourContrasts_id)
