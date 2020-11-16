ALTER TABLE mtc_admin.[check] ADD receivedByServerAt DATETIMEOFFSET NULL;

CREATE INDEX check_receivedByServerAt_index
  ON [mtc_admin].[check] (receivedByServerAt);
