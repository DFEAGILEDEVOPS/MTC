INSERT INTO mtc_admin.z_pupilGroup_archive (id, group_id, pupil_id, createdAt, updatedAt)
SELECT id, group_id, pupil_id, createdAt, updatedAt FROM mtc_admin.pupilGroup
