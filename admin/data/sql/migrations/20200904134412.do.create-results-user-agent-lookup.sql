DROP TABLE IF EXISTS mtc_results.userAgentLookup;
CREATE TABLE mtc_results.userAgentLookup
([id]            [INT] IDENTITY ( 1, 1 ) NOT NULL,
 [createdAt]     [DATETIMEOFFSET](3)     NOT NULL DEFAULT GETUTCDATE(),
 [updatedAt]     [DATETIMEOFFSET](3)     NOT NULL DEFAULT GETUTCDATE(),
 [version]       [ROWVERSION],
 [userAgent]     NVARCHAR(4000)          NOT NULL,
 [userAgentHash] BINARY(32)              NOT NULL,
 CONSTRAINT [PK_userAgent] PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT [userAgent_userAgentHash_uindex] UNIQUE (userAgentHash)
);
