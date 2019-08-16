SET IDENTITY_INSERT mtc_admin.pupilGroup ON
INSERT INTO mtc_admin.pupilGroup
SELECT pupil_id, group_id, createdAt, updatedAt FROM mtc_admin.z_pupilGroup_archive
SET IDENTITY_INSERT mtc_admin.pupilGroup OFF
