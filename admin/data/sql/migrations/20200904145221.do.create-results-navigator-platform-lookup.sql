DROP TABLE IF EXISTS mtc_results.navigatorPlatformLookup;

CREATE TABLE mtc_results.navigatorPlatformLookup
([id]        [INT] IDENTITY ( 1, 1 ) NOT NULL,
 [createdAt] [DATETIMEOFFSET](3)     NOT NULL DEFAULT GETUTCDATE(),
 [updatedAt] [DATETIMEOFFSET](3)     NOT NULL DEFAULT GETUTCDATE(),
 [version]   [ROWVERSION],
 [platform]  nvarchar(255)           NOT NULL,
 CONSTRAINT [PK_navigatorPlatformLookup] PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT [navigatorPlatformLookup_platform_uindex] UNIQUE (platform),
 CONSTRAINT [navigatorPlatformLookup_platform_uppercase] CHECK (platform = TRIM(UPPER(platform)) COLLATE Latin1_General_CI_AI)
);
