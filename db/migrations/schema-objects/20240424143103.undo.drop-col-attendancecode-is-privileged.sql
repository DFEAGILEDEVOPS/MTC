 ALTER TABLE [mtc_admin].[attendanceCode] ADD isPrivileged BIT CONSTRAINT [DF_isPrivileged] DEFAULT ((0)) NULL;
