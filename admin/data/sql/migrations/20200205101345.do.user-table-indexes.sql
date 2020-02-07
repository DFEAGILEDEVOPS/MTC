IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[user]') AND NAME ='user_role_id_index')
BEGIN
    DROP INDEX user_role_id_index ON mtc_admin.[user];
END
CREATE INDEX user_role_id_index ON mtc_admin.[user] (role_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[user]') AND NAME ='user_school_id_index')
BEGIN
    DROP INDEX user_school_id_index ON mtc_admin.[user];
END
CREATE INDEX user_school_id_index ON mtc_admin.[user] (school_id)
