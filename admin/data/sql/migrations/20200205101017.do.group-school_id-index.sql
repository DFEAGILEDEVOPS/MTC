IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[group]') AND NAME ='group_school_id_index')
BEGIN
    DROP INDEX group_school_id_index ON mtc_admin.[group];
END
CREATE INDEX group_school_id_index ON mtc_admin.[group] (school_id)
