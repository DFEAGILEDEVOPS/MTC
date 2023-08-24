ALTER TABLE [mtc_admin].[pupilRestart]
    ADD [originCheck_id] INT NULL;

ALTER TABLE [mtc_admin].[pupilRestart]
    ADD [check_id] INT NULL;

ALTER TABLE [mtc_admin].[pupilRestart]  WITH CHECK ADD  CONSTRAINT [FK_pupilRestart_check_id_check_id] FOREIGN KEY([check_id])
REFERENCES [mtc_admin].[check] ([id]);

ALTER TABLE [mtc_admin].[pupilRestart] CHECK CONSTRAINT [FK_pupilRestart_check_id_check_id];

ALTER TABLE [mtc_admin].[pupilRestart]  WITH CHECK ADD  CONSTRAINT [FK_pupilRestart_originCheck_id] FOREIGN KEY([originCheck_id])
REFERENCES [mtc_admin].[check] ([id]);

ALTER TABLE [mtc_admin].[pupilRestart] CHECK CONSTRAINT [FK_pupilRestart_originCheck_id];

CREATE NONCLUSTERED INDEX [pupilRestart_originCheck_id_index] ON [mtc_admin].[pupilRestart]
(
	[originCheck_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY];

/****** Object:  Index [pupilRestart_check_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupilRestart_check_id_index] ON [mtc_admin].[pupilRestart]
(
	[check_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY];
