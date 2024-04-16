CREATE TABLE [mtc_admin].[questionReaderReasons](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[displayOrder] [smallint] NOT NULL,
	[description] [nvarchar](50) NOT NULL,
	[code] [char](3) NOT NULL
) ON [PRIMARY]

GO
ALTER TABLE [mtc_admin].[questionReaderReasons] ADD  CONSTRAINT [PK_questionReaderReasons] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

ALTER TABLE [mtc_admin].[questionReaderReasons] ADD CONSTRAINT [questionReaderReasons_code_uindex] UNIQUE NONCLUSTERED
(
	[code] ASC
) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

ALTER TABLE [mtc_admin].[questionReaderReasons] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO

ALTER TABLE [mtc_admin].[questionReaderReasons] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO

CREATE TRIGGER [mtc_admin].[questionReaderReasonsUpdatedAtTrigger]
    ON [mtc_admin].[questionReaderReasons]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[questionReaderReasons]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [questionReaderReasons].id = inserted.id
    END
GO

ALTER TABLE [mtc_admin].[questionReaderReasons] ENABLE TRIGGER [questionReaderReasonsUpdatedAtTrigger]
GO


--
-- Add the deleted cols back in
--
IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.pupilAccessArrangements')
                 AND col_name(object_ID, column_Id) = 'questionReaderReasons_id')
    BEGIN
        ALTER TABLE [mtc_admin].[pupilAccessArrangements]
            ADD [questionReaderReasons_id] int;
    END
GO

IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.pupilAccessArrangements')
                 AND col_name(object_ID, column_Id) = 'questionReaderOtherInformation')
    BEGIN
        ALTER TABLE [mtc_admin].[pupilAccessArrangements]
            ADD [questionReaderOtherInformation] NVARCHAR(1000);
    END
GO

ALTER TABLE mtc_admin.pupilAccessArrangements
  ADD CONSTRAINT FK_pupilAccessArrangements_questionReaderReasons_id
	FOREIGN KEY (questionReaderReasons_id)
	REFERENCES mtc_admin.questionReaderReasons (id);

GO

CREATE NONCLUSTERED INDEX pupilAccessArrangements_questionReaderReasons_id_index ON mtc_admin.pupilAccessArrangements
(
	questionReaderReasons_id ASC
) WITH ( PAD_INDEX = OFF,FILLFACTOR = 100,SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, STATISTICS_NORECOMPUTE = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON  ) ON [PRIMARY]
GO
