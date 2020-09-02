DROP TABLE IF EXISTS [mtc_admin].[userInputType];
CREATE TABLE mtc_admin.userInputType
([id]        [int] IDENTITY ( 1, 1 ) NOT NULL,
 [createdAt] [datetimeoffset](3)     NOT NULL DEFAULT GETUTCDATE(),
 [updatedAt] [datetimeoffset](3)     NOT NULL DEFAULT GETUTCDATE(),
 [version]   [rowversion],
 [name]      varchar(10)             NOT NULL,
 [code]      char(1)                 NOT NULL,
 CONSTRAINT [PK_userInputType] PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT [userInputType_code_uindex] UNIQUE([code])
);
