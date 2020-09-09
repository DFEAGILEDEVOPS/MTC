DROP TABLE IF EXISTS mtc_results.browserFamilyLookup;

CREATE TABLE mtc_results.browserFamilyLookup
([id]        INT IDENTITY ( 1, 1 ) NOT NULL,
 [createdAt] DATETIMEOFFSET(3)     NOT NULL DEFAULT GETUTCDATE(),
 [updatedAt] DATETIMEOFFSET(3)     NOT NULL DEFAULT GETUTCDATE(),
 [version]   ROWVERSION,
 [family]    NVARCHAR(255)         NOT NULL,
 CONSTRAINT [PK_browserFamilyLookup] PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT [browserFamilyLookup_uppercase] CHECK (family = TRIM(UPPER(family)) COLLATE Latin1_General_CI_AI),
 CONSTRAINT [browserFamilyLookup_family_uindex] UNIQUE (family)
);
