IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAccessArrangements]') AND NAME ='pupilAccessArrangements_questionReaderReasons_id_index')
BEGIN
    DROP INDEX pupilAccessArrangements_questionReaderReasons_id_index ON mtc_admin.[pupilAccessArrangements];
END
CREATE INDEX pupilAccessArrangements_questionReaderReasons_id_index ON mtc_admin.[pupilAccessArrangements] (questionReaderReasons_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAccessArrangements]') AND NAME ='pupilAccessArrangements_pupil_id_index')
BEGIN
    DROP INDEX pupilAccessArrangements_pupil_id_index ON mtc_admin.[pupilAccessArrangements];
END
CREATE INDEX pupilAccessArrangements_pupil_id_index ON mtc_admin.[pupilAccessArrangements] (pupil_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAccessArrangements]') AND NAME ='pupilAccessArrangements_accessArrangements_id_index')
BEGIN
    DROP INDEX pupilAccessArrangements_accessArrangements_id_index ON mtc_admin.[pupilAccessArrangements];
END
CREATE INDEX pupilAccessArrangements_accessArrangements_id_index ON mtc_admin.[pupilAccessArrangements] (accessArrangements_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAccessArrangements]') AND NAME ='pupilAccessArrangements_pupilFontSizes_id_index')
BEGIN
    DROP INDEX pupilAccessArrangements_pupilFontSizes_id_index ON mtc_admin.[pupilAccessArrangements];
END
CREATE INDEX pupilAccessArrangements_pupilFontSizes_id_index ON mtc_admin.[pupilAccessArrangements] (pupilFontSizes_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[pupilAccessArrangements]') AND NAME ='pupilAccessArrangements_pupilColourContrasts_id_index')
BEGIN
    DROP INDEX pupilAccessArrangements_pupilColourContrasts_id_index ON mtc_admin.[pupilAccessArrangements];
END
CREATE INDEX pupilAccessArrangements_pupilColourContrasts_id_index ON mtc_admin.[pupilAccessArrangements] (pupilColourContrasts_id)
