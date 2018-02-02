-- We need to make the pupil and school pins long enough to
-- capture incorrect pin entries (for analysis) but no so long as to allow
-- a DoS attack to overwhelm the server.
ALTER TABLE mtc.mtc_admin.pupilLogonEvent ALTER COLUMN pupilPin NVARCHAR(50) NOT NULL;
ALTER TABLE mtc.mtc_admin.pupilLogonEvent ALTER COLUMN schoolPin NVARCHAR(50) NOT NULL;
