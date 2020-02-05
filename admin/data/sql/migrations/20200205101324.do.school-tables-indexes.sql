-- sce schools
CREATE INDEX idx_sce_school_id ON mtc_admin.[sce] (school_id) WITH (DROP_EXISTING = ON)

-- school score
CREATE INDEX idx_schoolScore_school_id ON mtc_admin.[schoolScore] (school_id) WITH (DROP_EXISTING = ON)
CREATE INDEX idx_schoolScore_checkWindow_id ON mtc_admin.[schoolScore] (checkWindow_id) WITH (DROP_EXISTING = ON)
