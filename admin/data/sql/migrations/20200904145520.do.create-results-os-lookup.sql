DROP TABLE IF EXISTS mtc_results.uaOperatingSystemLookup;

CREATE TABLE mtc_results.uaOperatingSystemLookup
([id]        INT IDENTITY ( 1, 1 ) NOT NULL,
 [createdAt] DATETIMEOFFSET(3)     NOT NULL DEFAULT GETUTCDATE(),
 [updatedAt] DATETIMEOFFSET(3)     NOT NULL DEFAULT GETUTCDATE(),
 [version]   ROWVERSION,
 [os]        NVARCHAR(255)         NOT NULL,
 CONSTRAINT [PK_uaOperatingSystemLookup] PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT [uaOperatingSystemLookup_Uppercase] CHECK (os = UPPER(os) COLLATE Latin1_General_CI_AI),
 CONSTRAINT [uaOperatingSystemLookup_os_uindex] UNIQUE (os)
);
