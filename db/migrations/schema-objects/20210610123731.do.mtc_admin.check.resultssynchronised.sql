ALTER TABLE mtc_admin.[check]
	ADD resultsSynchronised bit
  CONSTRAINT DF_resultsSynchronised_default DEFAULT 0 NOT NULL
