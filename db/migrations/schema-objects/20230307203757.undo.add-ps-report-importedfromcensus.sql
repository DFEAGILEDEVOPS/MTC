ALTER TABLE [mtc_results].[psychometricReport]
 DROP
  CONSTRAINT IF EXISTS [DF_ImportedFromCensus],
  COLUMN IF EXISTS [ImportedFromCensus];
