UPDATE p
SET group_id = pg.group_id
FROM mtc_admin.pupilGroup pg
JOIN mtc_admin.pupil p ON pg.pupil_id = p.id
