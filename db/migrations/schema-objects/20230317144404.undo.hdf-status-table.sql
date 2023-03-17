IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[mtc_admin].[hdfStatus]') AND type in (N'U'))
DROP TABLE [mtc_admin].[hdfStatus]
