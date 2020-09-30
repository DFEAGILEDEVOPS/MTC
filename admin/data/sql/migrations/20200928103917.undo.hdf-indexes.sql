IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('[mtc_admin].hdf') AND NAME ='ix_hdf_school_checkWindow_id')
BEGIN
  DROP INDEX [mtc_admin].hdf.ix_hdf_school_checkWindow_id
END

IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('[mtc_admin].hdf') AND NAME ='ix_hdf_user_id')
BEGIN
  DROP INDEX [mtc_admin].hdf.ix_hdf_user_id
END
