SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[schoolPin](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[val] [char](3) NOT NULL
) ON [PRIMARY]
GO
ALTER TABLE [mtc_admin].[schoolPin] ADD  CONSTRAINT [PK_schoolPin] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [mtc_admin].[schoolPin] ADD  CONSTRAINT [IX_schoolPin_val_unique] UNIQUE NONCLUSTERED
(
	[val] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO
ALTER TABLE [mtc_admin].[schoolPin] ADD  CONSTRAINT [DF_schoolPin_created_at]  DEFAULT (GETUTCDATE()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[schoolPin] ADD  CONSTRAINT [DF_schoolPin_updated_at]  DEFAULT (GETUTCDATE()) FOR [updatedAt]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[schoolPinUpdatedAtTrigger]
    ON [mtc_admin].[schoolPin]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[schoolPin]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [schoolPin].id = inserted.id
    END
GO
ALTER TABLE [mtc_admin].[schoolPin] ENABLE TRIGGER [schoolPinUpdatedAtTrigger]
GO
