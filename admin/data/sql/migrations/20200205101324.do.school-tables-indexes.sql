-- sce schools
IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[sce]') AND NAME ='idx_sce_school_id')
BEGIN
    DROP INDEX idx_sce_school_id ON mtc_admin.[sce];
END
CREATE INDEX idx_sce_school_id ON mtc_admin.[sce] (school_id)

-- school score
IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[schoolScore]') AND NAME ='idx_schoolScore_school_id')
BEGIN
    DROP INDEX idx_schoolScore_school_id ON mtc_admin.[schoolScore];
END
CREATE INDEX idx_schoolScore_school_id ON mtc_admin.[schoolScore] (school_id)

IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[schoolScore]') AND NAME ='idx_schoolScore_checkWindow_id')
BEGIN
    DROP INDEX idx_schoolScore_checkWindow_id ON mtc_admin.[schoolScore];
END
CREATE INDEX idx_schoolScore_checkWindow_id ON mtc_admin.[schoolScore] (checkWindow_id)
