CREATE TABLE [mtc_admin].[typeOfEstablishmentLookup] (
  id INT NOT NULL IDENTITY(1, 1) CONSTRAINT [PK_typeOfEstablishmentLookup] PRIMARY KEY CLUSTERED (id ASC),
  createdAt datetimeoffset(7) NOT NULL CONSTRAINT [DF_typeOfEstablishmentLookup_createdAt_default] DEFAULT(GETUTCDATE()),
  updatedAt datetimeoffset(7) NOT NULL CONSTRAINT [DF_typeOfEstablishmentLookup_updatedAt_default] DEFAULT(GETUTCDATE()),
  version TIMESTAMP NOT NULL,
  name NVARCHAR(50) NOT NULL,
  code INT NOT NULL CONSTRAINT [IX_typeOfEstablishment_code_unique] UNIQUE (code),
);
GO

INSERT INTO [mtc_admin].[typeOfEstablishmentLookup]  (code, name) VALUES
	(1, 'Community school'),
	(2, 'Voluntary aided school'),
	(3, 'Voluntary controlled school'),
  -- 4 missing
	(5, 'Foundation school'),
  (6, 'City technology college'),
  (7, 'Community special school'),
  (8, 'Non-maintained special school'),
  (10, 'Other independent special school'),
  (11, 'Other independent school'),
  (12, 'Foundation special school'),
  -- 13 missing
  (14, 'Pupil referral unit'),
  (15, 'Local authority nursery school'),
  -- 16 && 17 missing
  (18, 'Further education'),
  -- 19 to 23 missing
  (24, 'Secure units'),
  (25, 'Offshore schools'),
  (26, 'Service children''s education'),
  (27, 'Miscellaneous'),
  (28, 'Academy sponsor led'),
  (29, 'Higher education institutions'),
  (30, 'Welsh establishment'),
  (31, 'Sixth form centres'),
  (32, 'Special post 16 institution'),
  (33, 'Academy special sponsor led'),
  (34,	'Academy converter'),
  (35, 'Free schools'),
  (36, 'Free schools special'),
  (37, 'British schools overseas'),
  (38, 'Free schools alternative provision'),
  (39, 'Free schools 16 to 19'),
  (40, 'University technical college'),
  (41, 'Studio schools'),
  (42, 'Academy alternative provision converter'),
  (43, 'Academy alternative provision sponsor led'),
  (44, 'Academy special converter'),
  (45, 'Academy 16-19 converter'),
  (46, 'Academy 16 to 19 sponsor led'),
  -- 47 to 55 missing
  (56, 'Institution funded by other government department')

GO
