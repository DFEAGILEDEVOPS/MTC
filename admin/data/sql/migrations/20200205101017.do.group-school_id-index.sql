IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[group]') AND NAME ='idx_group_school_id')
BEGIN
    DROP INDEX idx_group_school_id ON mtc_admin.[group];
END
CREATE INDEX idx_group_school_id ON mtc_admin.[group] (school_id)
