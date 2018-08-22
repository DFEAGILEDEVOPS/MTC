ALTER TABLE [mtc_admin].pupilAccessArrangements ADD accessArrangements_id int NOT NULL
ALTER TABLE [mtc_admin].pupilAccessArrangements
ADD CONSTRAINT FK_pupilAccessArrangements_accessArrangements_id
FOREIGN KEY (accessArrangements_id) REFERENCES [mtc_admin].accessArrangements (id)
ALTER TABLE [mtc_admin].pupilAccessArrangements DROP COLUMN accessArrangements_ids
