DROP TABLE IF EXISTS mtc_results.userInputType;

CREATE TABLE mtc_results.userInputType
([id]        INT IDENTITY ( 1, 1 ) NOT NULL,
 [createdAt] DATETIMEOFFSET(3)     NOT NULL DEFAULT GETUTCDATE(),
 [updatedAt] DATETIMEOFFSET(3)     NOT NULL DEFAULT GETUTCDATE(),
 [version]   ROWVERSION,
 [name]      NVARCHAR(10)          NOT NULL,
 [code]      CHAR(1)               NOT NULL,
 CONSTRAINT [PK_userInputType] PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT [userInputType_code_uindex] UNIQUE ([code])
);
