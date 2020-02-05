CREATE INDEX idx_user_role_id ON mtc_admin.[user] (role_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_user_school_id ON mtc_admin.[user] (school_id) WITH (DROP_EXISTING = ON)
