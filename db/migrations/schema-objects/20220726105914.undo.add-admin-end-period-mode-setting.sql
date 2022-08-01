-- Need to drop the default constraint for column isPostAdminEndDateUnavailable.
ALTER TABLE mtc_admin.settings DROP CONSTRAINT IF EXISTS DF_isPostAdminEndDateUnavailable;

ALTER TABLE mtc_admin.settings DROP COLUMN IF EXISTS isPostAdminEndDateUnavailable;
