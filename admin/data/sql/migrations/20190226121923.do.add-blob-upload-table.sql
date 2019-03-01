CREATE TABLE [mtc_admin].[azureBlobFileType] (
   [id] [int] IDENTITY(1,1) NOT NULL,
   [createdAt] [datetimeoffset](3) NOT NULL DEFAULT GETUTCDATE(),
   [updatedAt] [datetimeoffset](3) NOT NULL DEFAULT GETUTCDATE(),
   [version] [rowversion],
   [code] varchar(10) NOT NULL,
   [description] nvarchar(100) NOT NULL,
   CONSTRAINT [PK_azureBlobFileType] PRIMARY KEY CLUSTERED
     ([id] ASC)
     WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
   CONSTRAINT [IX_azureBlobFileType_uindex] UNIQUE([code])
);


CREATE TABLE [mtc_admin].[azureBlobFile] (
  [id] [int] IDENTITY(1,1) NOT NULL,
  [createdAt] [datetimeoffset](3) NOT NULL DEFAULT GETUTCDATE(),
  [updatedAt] [datetimeoffset](3) NOT NULL DEFAULT GETUTCDATE(),
  [version] [rowversion],
  [container] VARCHAR(1000) NOT NULL,
  [fileName] VARCHAR(1000) NOT NULL,
  [eTag] VARCHAR(100) NOT NULL,
  [md5] BINARY(16) NOT NULL,
  [azureBlobFileType_id] INT NOT NULL,
  [urlSlug] uniqueidentifier NOT NULL DEFAULT NEWID(),
  CONSTRAINT [PK_azureBlobFile] PRIMARY KEY CLUSTERED
    ([id] ASC)
    WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
  CONSTRAINT [FK_azureBlobFile_azureBlobFileType_id_azureBlobFileType_id] FOREIGN KEY (azureBlobFileType_id) REFERENCES [mtc_admin].[azureBlobFileType](id),
  CONSTRAINT [IX_urlSlug_uindex] UNIQUE([urlSlug])
);