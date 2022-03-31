CREATE TABLE mtc_admin.serviceMessageBorderColourLookup (
		id INT NOT NULL IDENTITY(1, 1)
			CONSTRAINT [PK_serviceMessageBorderColourLookup] PRIMARY KEY CLUSTERED (id ASC),
		createdAt datetimeoffset(7) NOT NULL
			CONSTRAINT [DF_serviceMessageBorderColourLookup_createdAt_default] DEFAULT(GETUTCDATE()),
		updatedAt datetimeoffset(7) NOT NULL
			CONSTRAINT [DF_serviceMessageBorderColourLookup_updatedAt_default] DEFAULT(GETUTCDATE()),
		version TIMESTAMP NOT NULL,
		displayOrder SMALLINT NOT NULL,
		description NVARCHAR(50) NOT NULL,
		code CHAR(1) NOT NULL,
		CONSTRAINT [IX_serviceMessageBorderColourLookup_code_unique] UNIQUE (code),
);
GO

INSERT INTO mtc_admin.serviceMessageBorderColourLookup (displayOrder, description, code) VALUES
	(1, 'Red', 'R'),
	(2, 'Orange', 'O'),
	(3, 'Green', 'G'),
	(4, 'Blue', 'B');
GO



--
-- Refactor part 1: add the new col
--
ALTER TABLE
	[mtc_admin].[serviceMessage]
ADD
	[borderColourLookupId] INT NOT NULL;
GO
--
-- Refactor part 2: ensure all rows have a value
--
UPDATE [mtc_admin].[serviceMessage]
SET borderColourLookupId = (SELECT id FROM [mtc_admin].[serviceMessageBorderColourLookup] WHERE code = 'R')
;
GO

--
-- Refactor part 3: make the new col not null and a FK
--
ALTER TABLE [mtc_admin].[serviceMessage]
ALTER COLUMN borderColourLookupId INT NOT NULL;
GO

ALTER TABLE [mtc_admin].[serviceMessage]
ADD CONSTRAINT [FK_serviceMessage_borderColourLookupId_serviceMessageBorderColourLookup_id]
FOREIGN KEY (borderColourLookupId) REFERENCES [mtc_admin].[serviceMessageBorderColourLookup] (id)
;
GO
