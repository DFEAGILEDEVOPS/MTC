INSERT INTO mtc_admin.pupilGroup
SELECT pupil_id, group_id, createdAt, updatedAt FROM mtc_admin.z_pupilGroup_archive
