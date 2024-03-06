ALTER TABLE [mtc_admin].[pupil] ADD [pupilAgeReason_id] [int] NULL;

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[pupilAgeReason](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[pupil_id] [int] NOT NULL,
	[reason] [nvarchar](max) NOT NULL,
	[recordedBy_userId] [int] NOT NULL,
	[lastUpdatedBy_userId] [int] NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
	[updatedAt] [datetimeoffset](7) NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [mtc_admin].[pupilAgeReason] ADD  CONSTRAINT [PK_pupilAgeReason] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [mtc_admin].[pupilAgeReason] ADD  CONSTRAINT [pupilAgeReason_pupil_id_uindex] UNIQUE NONCLUSTERED
(
	[pupil_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [mtc_admin].[pupilAgeReason] ADD  CONSTRAINT [DF_createdAt]  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[pupilAgeReason] ADD  CONSTRAINT [DF_updatedAt]  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[pupilAgeReason]  WITH CHECK ADD  CONSTRAINT [FK_puilAgeReason_recordedBy_userId_user_id] FOREIGN KEY([recordedBy_userId])
REFERENCES [mtc_admin].[user] ([id])
GO
ALTER TABLE [mtc_admin].[pupilAgeReason] CHECK CONSTRAINT [FK_puilAgeReason_recordedBy_userId_user_id]
GO
ALTER TABLE [mtc_admin].[pupilAgeReason]  WITH CHECK ADD  CONSTRAINT [FK_pupilAgeReason_lastUpdatedBy_userId_user_id] FOREIGN KEY([lastUpdatedBy_userId])
REFERENCES [mtc_admin].[user] ([id])
GO
ALTER TABLE [mtc_admin].[pupilAgeReason] CHECK CONSTRAINT [FK_pupilAgeReason_lastUpdatedBy_userId_user_id]
GO
ALTER TABLE [mtc_admin].[pupilAgeReason]  WITH CHECK ADD  CONSTRAINT [FK_pupilAgeReason_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [mtc_admin].[pupil] ([id])
GO
ALTER TABLE [mtc_admin].[pupilAgeReason] CHECK CONSTRAINT [FK_pupilAgeReason_pupil_id]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [mtc_admin].[pupilAgeReasonUpdatedAtTrigger]
ON [mtc_admin].[pupilAgeReason]
FOR UPDATE
AS
BEGIN
    UPDATE [mtc_admin].[pupilAgeReason]
    SET updatedAt = GETUTCDATE()
    FROM inserted
    WHERE [pupilAgeReason].[id] = inserted.id
END;
GO
ALTER TABLE [mtc_admin].[pupilAgeReason] ENABLE TRIGGER [pupilAgeReasonUpdatedAtTrigger]
GO


ALTER TABLE [mtc_admin].[pupil]  WITH CHECK ADD  CONSTRAINT [FK_pupil_pupilAgeReason_id] FOREIGN KEY([pupilAgeReason_id])
REFERENCES [mtc_admin].[pupilAgeReason] ([id])
GO
ALTER TABLE [mtc_admin].[pupil] CHECK CONSTRAINT [FK_pupil_pupilAgeReason_id]
GO
