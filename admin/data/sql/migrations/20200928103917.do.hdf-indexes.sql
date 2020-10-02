DROP INDEX IF EXISTS [mtc_admin].[hdf].[ix_hdf_school_checkWindow_id];
DROP INDEX IF EXISTS [mtc_admin].[hdf].[ix_hdf_user_id];

CREATE UNIQUE INDEX ix_hdf_school_checkWindow_id ON [mtc_admin].hdf (school_id, checkWindow_id);
CREATE INDEX ix_hdf_user_id ON [mtc_admin].hdf (user_id);
