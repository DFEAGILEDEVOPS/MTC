SET IDENTITY_INSERT [mtc_admin].[group] ON
INSERT INTO [mtc_admin].[group] (id, [name], isDeleted, createdAt, updatedAt, school_id)
SELECT id, [name], isDeleted, createdAt, updatedAt, school_id FROM [mtc_admin].z_group_archive WHERE isDeleted=1
SET IDENTITY_INSERT [mtc_admin].[group] OFF
