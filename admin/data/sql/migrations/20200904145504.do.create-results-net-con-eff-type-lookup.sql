DROP TABLE IF EXISTS mtc_results.networkConnectionEffectiveTypeLookup;
CREATE TABLE mtc_results.networkConnectionEffectiveTypeLookup
([id]            INT IDENTITY ( 1, 1 ) NOT NULL,
 [createdAt]     DATETIMEOFFSET(3)     NOT NULL DEFAULT GETUTCDATE(),
 [updatedAt]     DATETIMEOFFSET(3)     NOT NULL DEFAULT GETUTCDATE(),
 [version]       ROWVERSION,
 [effectiveType] NVARCHAR(10)          NOT NULL,
 CONSTRAINT [PK_networkConnectionEffectiveTypeLookup] PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT [networkConnectionEffectiveTypeLookup_effectiveType_uindex] UNIQUE (effectiveType)
);
