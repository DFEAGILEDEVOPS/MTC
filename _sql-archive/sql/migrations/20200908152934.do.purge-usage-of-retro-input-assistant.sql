DELETE FROM [mtc_admin].pupilAccessArrangements WHERE accessArrangements_id IN (SELECT id FROM [mtc_admin].[accessArrangements] WHERE code='RIA')
