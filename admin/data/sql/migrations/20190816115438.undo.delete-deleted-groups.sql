SET IDENTITY_INSERT [mtc_admin].[group] ON
INSERT INTO [mtc_admin].[group]
SELECT * FROM [mtc_admin].mtc_admin.z_group_archive WHERE isDeleted=1
SET IDENTITY_INSERT [mtc_admin].[group] OFF
