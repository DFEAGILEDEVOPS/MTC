ALTER TABLE [mtc_admin].pupilAccessArrangements ADD pupilFontSizes_id int NULL
ALTER TABLE [mtc_admin].pupilAccessArrangements ADD pupilColourContrasts_Id int NULL

ALTER TABLE [mtc_admin].[pupilAccessArrangements] WITH CHECK ADD CONSTRAINT [FK_pupilAccessArrangements_pupilFontSizes_id_pupilFontSizes_id] FOREIGN KEY([pupilFontSizes_id])
REFERENCES [mtc_admin].[pupilFontSizes] ([id])

ALTER TABLE [mtc_admin].[pupilAccessArrangements] WITH CHECK ADD CONSTRAINT [FK_pupilAccessArrangements_pupilColourContrasts_id_pupilColourContrasts_id] FOREIGN KEY([pupilColourContrasts_id])
REFERENCES [mtc_admin].[pupilColourContrasts] ([id])
