CREATE TABLE [mtc_admin].[hdfStatusLookup](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[description] [nvarchar](50) NOT NULL,
	[hdfStatusCode] [char](3) NOT NULL
) ON [PRIMARY]

ALTER TABLE [mtc_admin].[hdfStatusLookup] ADD CONSTRAINT [PK_hdfStatusLookup] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

ALTER TABLE [mtc_admin].[hdfStatusLookup] ADD  CONSTRAINT [hdfStatusLookup_code_uindex] UNIQUE NONCLUSTERED
(
	[hdfStatusCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

ALTER TABLE [mtc_admin].[hdfStatusLookup] ADD DEFAULT (getutcdate()) FOR [createdAt]

ALTER TABLE [mtc_admin].[hdfStatusLookup] ADD DEFAULT (getutcdate()) FOR [updatedAt]
