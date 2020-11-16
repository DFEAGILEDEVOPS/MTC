-- to be utilised once pupil groups are completely working from pupil table...
-- and pupil group is about to be dropped
UPDATE p
SET group_id = pg.group_id
FROM mtc_admin.pupilGroup pg
JOIN mtc_admin.pupil p ON pg.pupil_id = p.id
