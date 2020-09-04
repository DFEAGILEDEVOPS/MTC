DROP TABLE IF EXISTS mtc_results.deviceOrientationLookup;

CREATE TABLE mtc_results.deviceOrientationLookup
([id]          [INT] IDENTITY ( 1, 1 ) NOT NULL,
 [createdAt]   [DATETIMEOFFSET](3)     NOT NULL DEFAULT GETUTCDATE(),
 [updatedAt]   [DATETIMEOFFSET](3)     NOT NULL DEFAULT GETUTCDATE(),
 [version]     [ROWVERSION],
 [orientation] NVARCHAR(32),
 CONSTRAINT [PK_deviceOrientationLookup] PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT [deviceOrientationLookup_orientation_uindex] UNIQUE (orientation)
);
