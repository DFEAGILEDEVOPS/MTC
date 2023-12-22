IF NOT EXISTS(SELECT *
                FROM INFORMATION_SCHEMA.TABLES
               WHERE TABLE_NAME = 'serviceMessageAreaLookup'
                 AND TABLE_SCHEMA = 'mtc_admin')
BEGIN
    CREATE TABLE mtc_admin.serviceMessageAreaLookup (
		id 						int NOT NULL IDENTITY(1,1) CONSTRAINT PK_serviceMessageAreaLookup PRIMARY KEY CLUSTERED (id ASC),
		createdAt 		datetimeoffset(7) NOT NULL CONSTRAINT [DF_serviceAreaMessageLookup_createdAt_default] DEFAULT(GETUTCDATE()),
		updatedAt 		datetimeoffset(7) NOT NULL CONSTRAINT [DF_serviceMessageAreaLookup_updatedAt_default] DEFAULT(GETUTCDATE()),
		version 			timestamp NOT NULL,
		code					char(1) NOT NULL CONSTRAINT [IX_serviceMessageAreaLookup_code_unique] UNIQUE (code),
		description 	nvarchar(50) NOT NULL
	)
END
