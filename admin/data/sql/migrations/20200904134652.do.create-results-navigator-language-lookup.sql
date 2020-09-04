DROP TABLE IF EXISTS mtc_results.navigatorLanguageLookup;
CREATE TABLE mtc_results.navigatorLanguageLookup
([id]           [INT] IDENTITY ( 1, 1 ) NOT NULL,
 [createdAt]    [DATETIMEOFFSET](3)     NOT NULL DEFAULT GETUTCDATE(),
 [updatedAt]    [DATETIMEOFFSET](3)     NOT NULL DEFAULT GETUTCDATE(),
 [version]      [ROWVERSION],
 [platformLang] nvarchar(36),
 CONSTRAINT [PK_navigatorLanguageLookup] PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT [navigatorLanguageLookup_platformLang_uindex] UNIQUE (platformLang)
);
