-- sce schools
IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[sce]') AND NAME ='sce_school_id_index')
BEGIN
    DROP INDEX sce_school_id_index ON mtc_admin.[sce];
END
CREATE INDEX sce_school_id_index ON mtc_admin.[sce] (school_id)

-- school score
IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[schoolScore]') AND NAME ='schoolScore_school_id_index')
BEGIN
    DROP INDEX schoolScore_school_id_index ON mtc_admin.[schoolScore];
END
CREATE INDEX schoolScore_school_id_index ON mtc_admin.[schoolScore] (school_id)

IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[schoolScore]') AND NAME ='schoolScore_checkWindow_id_index')
BEGIN
    DROP INDEX schoolScore_checkWindow_id_index ON mtc_admin.[schoolScore];
END
CREATE INDEX schoolScore_checkWindow_id_index ON mtc_admin.[schoolScore] (checkWindow_id)
