ALTER TABLE mtc_admin.pupilAccessArrangements DROP CONSTRAINT FK_pupilAccessArrangements__accessArrangements_id;

ALTER TABLE mtc_admin.pupilAccessArrangements DROP COLUMN accessArrangements_id;

ALTER TABLE mtc_admin.pupilAccessArrangements ADD accessArrangements_ids nvarchar(50) not null;
