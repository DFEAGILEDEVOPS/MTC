ALTER TABLE [mtc_admin].schoolScore DROP COLUMN version
ALTER TABLE [mtc_admin].schoolScore DROP CONSTRAINT DF_school_score_updated_at
ALTER TABLE [mtc_admin].schoolScore DROP COLUMN updatedAt
ALTER TABLE [mtc_admin].schoolScore DROP CONSTRAINT DF_school_score_created_at
ALTER TABLE [mtc_admin].schoolScore DROP COLUMN createdAt
