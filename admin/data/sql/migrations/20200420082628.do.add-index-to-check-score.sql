DROP INDEX IF EXISTS mtc_admin.checkScore.ix_checkScore_check_id;
CREATE INDEX ix_checkScore_check_id ON mtc_admin.checkScore([checkId]);
