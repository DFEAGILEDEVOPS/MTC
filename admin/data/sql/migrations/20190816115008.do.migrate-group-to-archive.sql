INSERT INTO mtc_admin.z_group_archive (id, [name], isDeleted, createdAt, updatedAt, school_id)
SELECT id, [name], isDeleted, createdAt, updatedAt, school_id FROM mtc_admin.[group]
