ALTER TABLE mtc_admin.checkPin ADD pinValidFromUtc [datetimeoffset](3) NOT NULL;
EXEC sp_rename 'mtc_admin.checkPin.pinExpiresAt', pinExpiresAtUtc, 'COLUMN';
