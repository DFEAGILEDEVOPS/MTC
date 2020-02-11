EXEC sp_rename 'mtc_admin.checkPin.pinExpiresAtUtc', pinExpiresAt, 'COLUMN';
ALTER TABLE mtc_admin.checkPin DROP COLUMN pinValidFromUtc;
