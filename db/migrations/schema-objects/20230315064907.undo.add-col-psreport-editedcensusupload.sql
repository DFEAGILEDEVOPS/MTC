 ALTER TABLE [mtc_admin].[pupil]
 DROP
  CONSTRAINT DF_isEdited,
  COLUMN IF EXISTS  [isEdited];
