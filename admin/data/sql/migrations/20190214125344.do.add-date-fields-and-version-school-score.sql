ALTER TABLE [mtc_admin].schoolScore ADD createdAt datetimeoffset(3) NOT NULL
  CONSTRAINT DF_school_score_created_at DEFAULT GETUTCDATE()
ALTER TABLE [mtc_admin].schoolScore ADD updatedAt datetimeoffset(3) NOT NULL
  CONSTRAINT DF_school_score_updated_at DEFAULT GETUTCDATE()
ALTER TABLE [mtc_admin].schoolScore ADD version rowversion
