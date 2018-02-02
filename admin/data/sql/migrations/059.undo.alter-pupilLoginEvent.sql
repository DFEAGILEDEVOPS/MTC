-- We need to make the pupil and school pins long enough to
-- capture incorrect pin entries (for analysis) but no so long as to allow
-- a DoS attack to overwhelm the server.
ALTER TABLE mtc.mtc_admin.pupilLogonEvent ALTER COLUMN pupilPin CHAR(5) NOT NULL;
ALTER TABLE mtc.mtc_admin.pupilLogonEvent ALTER COLUMN schoolPin CHAR(8) NOT NULL;
