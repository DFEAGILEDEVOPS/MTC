IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[user]') AND NAME ='idx_user_role_id')
BEGIN
    DROP INDEX idx_user_role_id ON mtc_admin.[user];
END
CREATE INDEX idx_user_role_id ON mtc_admin.[user] (role_id)


IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('mtc_admin.[user]') AND NAME ='idx_user_school_id')
BEGIN
    DROP INDEX idx_user_school_id ON mtc_admin.[user];
END
CREATE INDEX idx_user_school_id ON mtc_admin.[user] (school_id)
