CREATE TABLE [mtc_admin].[checkFormAllocation](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [rowversion] NOT NULL,
	[pupil_Id] [int] NOT NULL,
	[checkForm_Id] [int] NOT NULL,
	[checkWindow_Id] [int] NOT NULL,
	[checkCode] [uniqueidentifier] NOT NULL,
	[checkStatus_id] [int] NOT NULL,
	[isLiveCheck] [bit] NOT NULL,
 CONSTRAINT [PK_checkFormAllocation] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [mtc_admin].[checkFormAllocation] ADD  DEFAULT (getutcdate()) FOR [createdAt]
ALTER TABLE [mtc_admin].[checkFormAllocation] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
ALTER TABLE [mtc_admin].[checkFormAllocation] ADD  DEFAULT (newid()) FOR [checkCode]
ALTER TABLE [mtc_admin].[checkFormAllocation] ADD  DEFAULT ((1)) FOR [checkStatus_id]

ALTER TABLE [mtc_admin].[checkFormAllocation]  WITH CHECK ADD  CONSTRAINT [checkFormAllocation_checkForm_id_fk] FOREIGN KEY([checkForm_Id])
REFERENCES [mtc_admin].[checkForm] ([id])

ALTER TABLE [mtc_admin].[checkFormAllocation] CHECK CONSTRAINT [checkFormAllocation_checkForm_id_fk]

ALTER TABLE [mtc_admin].[checkFormAllocation]  WITH CHECK ADD  CONSTRAINT [checkFormAllocation_checkStatus_id_fk] FOREIGN KEY([checkStatus_id])
REFERENCES [mtc_admin].[checkStatus] ([id])

ALTER TABLE [mtc_admin].[checkFormAllocation] CHECK CONSTRAINT [checkFormAllocation_checkStatus_id_fk]

ALTER TABLE [mtc_admin].[checkFormAllocation]  WITH CHECK ADD  CONSTRAINT [checkFormAllocation_checkWindow_id_fk] FOREIGN KEY([checkWindow_Id])
REFERENCES [mtc_admin].[checkWindow] ([id])

ALTER TABLE [mtc_admin].[checkFormAllocation] CHECK CONSTRAINT [checkFormAllocation_checkWindow_id_fk]

ALTER TABLE [mtc_admin].[checkFormAllocation]  WITH CHECK ADD  CONSTRAINT [checkFormAllocation_pupil_id_fk] FOREIGN KEY([pupil_Id])
REFERENCES [mtc_admin].[pupil] ([id])

ALTER TABLE [mtc_admin].[checkFormAllocation] CHECK CONSTRAINT [checkFormAllocation_pupil_id_fk]
