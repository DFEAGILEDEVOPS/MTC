/*
Description: MTC Database Base Script
Index: 0
Author: Guy Harwood
Date: 23/11/2017 12:32
*/

CREATE DATABASE [mtc]
GO

/****** Object:  Table [dbo].[adminLogonEvent]    Script Date: 23/11/2017 11:54:14 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[adminLogonEvent](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NULL,
	[user_id] [int] NOT NULL,
	[sessionId] [nvarchar](max) NOT NULL,
	[remoteIp] [nvarchar](max) NOT NULL,
	[userAgent] [nvarchar](max) NOT NULL,
	[loginMethod] [nvarchar](max) NOT NULL,
	[ncaUserName] [nvarchar](max) NULL,
	[ncaEmailAddress] [nvarchar](max) NULL,
	[isAuthenticated] [bit] NOT NULL,
	[body] [nvarchar](max) NULL,
 CONSTRAINT [PK_adminLogonEvent] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[attendanceCode]    Script Date: 23/11/2017 11:54:14 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[attendanceCode](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NULL,
	[reason] [nvarchar](50) NOT NULL,
	[order] [tinyint] NOT NULL,
 CONSTRAINT [PK_attendanceCode] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[check]    Script Date: 23/11/2017 11:54:14 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[check](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NULL,
	[pupil_id] [int] NOT NULL,
	[checkCode] [uniqueidentifier] NOT NULL,
	[checkWindow_id] [int] NOT NULL,
	[checkForm_id] [int] NOT NULL,
	[pupilLoginDate] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_check] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[checkForm]    Script Date: 23/11/2017 11:54:14 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[checkForm](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](max) NOT NULL,
	[isDeleted] [bit] NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NULL,
 CONSTRAINT [PK_checkForm] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[checkWindow]    Script Date: 23/11/2017 11:54:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[checkWindow](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](max) NOT NULL,
	[startDate] [datetime2](7) NOT NULL,
	[endDate] [datetime2](7) NOT NULL,
	[registrationStartDate] [datetime2](7) NOT NULL,
	[registrationEndDate] [datetime2](7) NOT NULL,
	[isDeleted] [bit] NOT NULL,
 CONSTRAINT [PK_checkWindow] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[dbMigrationLog]    Script Date: 23/11/2017 11:54:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[dbMigrationLog](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[fileName] [nvarchar](max) NOT NULL,
	[appliedAt] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_dbMigrationLog] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[hdf]    Script Date: 23/11/2017 11:54:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[hdf](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[signedDate] [datetime2](7) NOT NULL,
	[declaration] [nvarchar](max) NOT NULL,
	[jobTitle] [nvarchar](max) NOT NULL,
	[fullName] [nvarchar](max) NOT NULL,
	[school_id] [int] NOT NULL,
	[user_id] [int] NOT NULL,
 CONSTRAINT [PK_hdf] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[pupil]    Script Date: 23/11/2017 11:54:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[pupil](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NULL,
	[school_id] [int] NOT NULL,
	[foreName] [nvarchar](max) NOT NULL,
	[middleNames] [nvarchar](max) NULL,
	[lastName] [nvarchar](max) NOT NULL,
	[gender] [char](1) NOT NULL,
	[dateOfBirth] [datetime2](7) NOT NULL,
	[pinExpiresAt] [datetime2](7) NULL,
	[upn] [char](13) NOT NULL,
	[pin] [char](5) NULL,
	[speechSynthesis] [bit] NOT NULL,
 CONSTRAINT [PK_pupil] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[pupilAttendance]    Script Date: 23/11/2017 11:54:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[pupilAttendance](
	[pupil_id] [int] IDENTITY(1,1) NOT NULL,
	[recordedByUser_id] [int] NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[attendanceCode_id] [int] NOT NULL,
	[updatedAt] [datetime2](7) NULL,
 CONSTRAINT [PK_pupilAttendance] PRIMARY KEY CLUSTERED 
(
	[pupil_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[question]    Script Date: 23/11/2017 11:54:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[question](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[factor1] [tinyint] NOT NULL,
	[factor2] [tinyint] NOT NULL,
	[order] [tinyint] NOT NULL,
	[checkForm_id] [int] NULL,
 CONSTRAINT [PK_question] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[role]    Script Date: 23/11/2017 11:54:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[role](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[role] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_role] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[school]    Script Date: 23/11/2017 11:54:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[school](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NULL,
	[leaCode] [int] NULL,
	[estabCode] [nvarchar](max) NULL,
	[name] [nvarchar](max) NOT NULL,
	[pin] [nvarchar](max) NULL,
	[pinExpiresAt] [datetime2](7) NULL,
 CONSTRAINT [PK_school] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[user]    Script Date: 23/11/2017 11:54:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[user](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NULL,
	[externalId] [nvarchar](max) NOT NULL,
	[passwordHash] [nvarchar](max) NULL,
	[school_id] [int] NOT NULL,
	[role_id] [int] NOT NULL,
 CONSTRAINT [PK_user] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

-- Defaults

GO
ALTER TABLE [dbo].[adminLogonEvent] ADD  CONSTRAINT [DF_adminLogonEvent_createdAt_default]  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[attendanceCode] ADD  CONSTRAINT [DF_attendanceCode_createdAt_default]  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[check] ADD  CONSTRAINT [DF_check_createdAt_default]  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[check] ADD  CONSTRAINT [DF_check_checkCode_default]  DEFAULT (newid()) FOR [checkCode]
GO
ALTER TABLE [dbo].[checkForm] ADD  CONSTRAINT [DF_checkForm_isDeleted_default]  DEFAULT ((0)) FOR [isDeleted]
GO
ALTER TABLE [dbo].[checkForm] ADD  CONSTRAINT [DF_checkForm_createdAt_default]  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[checkWindow] ADD  DEFAULT ((0)) FOR [isDeleted]
GO
ALTER TABLE [dbo].[dbMigrationLog] ADD  CONSTRAINT [DF_dbMigrationLog_appliedAt_default]  DEFAULT (getdate()) FOR [appliedAt]
GO
ALTER TABLE [dbo].[hdf] ADD  CONSTRAINT [DF_hdf_signedDate_default]  DEFAULT (getdate()) FOR [signedDate]
GO
ALTER TABLE [dbo].[pupil] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[pupil] ADD  DEFAULT (getdate()) FOR [updatedAt]
GO
ALTER TABLE [dbo].[pupil] ADD  DEFAULT ((0)) FOR [speechSynthesis]
GO
ALTER TABLE [dbo].[pupilAttendance] ADD  CONSTRAINT [DF_pupilAttendance_createdAt_default]  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[school] ADD  CONSTRAINT [DF_school_createdAt_default]  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[user] ADD  DEFAULT (getdate()) FOR [createdAt]
GO

-- Foreign Keys

ALTER TABLE [dbo].[adminLogonEvent]  WITH CHECK ADD  CONSTRAINT [adminLogonEvent_user_id_fk] FOREIGN KEY([user_id])
REFERENCES [dbo].[user] ([id])
GO
ALTER TABLE [dbo].[adminLogonEvent] CHECK CONSTRAINT [adminLogonEvent_user_id_fk]
GO
ALTER TABLE [dbo].[check]  WITH CHECK ADD  CONSTRAINT [check_checkForm_id_fk] FOREIGN KEY([checkForm_id])
REFERENCES [dbo].[checkForm] ([id])
GO
ALTER TABLE [dbo].[check] CHECK CONSTRAINT [check_checkForm_id_fk]
GO
ALTER TABLE [dbo].[check]  WITH CHECK ADD  CONSTRAINT [check_checkWindow_id_fk] FOREIGN KEY([checkWindow_id])
REFERENCES [dbo].[checkWindow] ([id])
GO
ALTER TABLE [dbo].[check] CHECK CONSTRAINT [check_checkWindow_id_fk]
GO
ALTER TABLE [dbo].[check]  WITH CHECK ADD  CONSTRAINT [check_pupil_id_fk] FOREIGN KEY([pupil_id])
REFERENCES [dbo].[pupil] ([id])
GO
ALTER TABLE [dbo].[check] CHECK CONSTRAINT [check_pupil_id_fk]
GO
ALTER TABLE [dbo].[hdf]  WITH CHECK ADD  CONSTRAINT [hdf_school_id_fk] FOREIGN KEY([school_id])
REFERENCES [dbo].[school] ([id])
GO
ALTER TABLE [dbo].[hdf] CHECK CONSTRAINT [hdf_school_id_fk]
GO
ALTER TABLE [dbo].[hdf]  WITH CHECK ADD  CONSTRAINT [hdf_user_id_fk] FOREIGN KEY([user_id])
REFERENCES [dbo].[user] ([id])
GO
ALTER TABLE [dbo].[hdf] CHECK CONSTRAINT [hdf_user_id_fk]
GO
ALTER TABLE [dbo].[pupil]  WITH CHECK ADD  CONSTRAINT [pupil_school_id_fk] FOREIGN KEY([school_id])
REFERENCES [dbo].[school] ([id])
GO
ALTER TABLE [dbo].[pupil] CHECK CONSTRAINT [pupil_school_id_fk]
GO
ALTER TABLE [dbo].[pupilAttendance]  WITH CHECK ADD  CONSTRAINT [pupilAttendance_attendanceCode_id_fk] FOREIGN KEY([attendanceCode_id])
REFERENCES [dbo].[attendanceCode] ([id])
GO
ALTER TABLE [dbo].[pupilAttendance] CHECK CONSTRAINT [pupilAttendance_attendanceCode_id_fk]
GO
ALTER TABLE [dbo].[pupilAttendance]  WITH CHECK ADD  CONSTRAINT [pupilAttendance_pupil_id_fk] FOREIGN KEY([pupil_id])
REFERENCES [dbo].[pupil] ([id])
GO
ALTER TABLE [dbo].[pupilAttendance] CHECK CONSTRAINT [pupilAttendance_pupil_id_fk]
GO
ALTER TABLE [dbo].[pupilAttendance]  WITH CHECK ADD  CONSTRAINT [pupilAttendance_user_id_fk] FOREIGN KEY([recordedByUser_id])
REFERENCES [dbo].[user] ([id])
GO
ALTER TABLE [dbo].[pupilAttendance] CHECK CONSTRAINT [pupilAttendance_user_id_fk]
GO
ALTER TABLE [dbo].[question]  WITH CHECK ADD  CONSTRAINT [question_checkForm_id_fk] FOREIGN KEY([checkForm_id])
REFERENCES [dbo].[checkForm] ([id])
GO
ALTER TABLE [dbo].[question] CHECK CONSTRAINT [question_checkForm_id_fk]
GO
ALTER TABLE [dbo].[user]  WITH CHECK ADD  CONSTRAINT [user_role_id_fk] FOREIGN KEY([role_id])
REFERENCES [dbo].[role] ([id])
GO
ALTER TABLE [dbo].[user] CHECK CONSTRAINT [user_role_id_fk]
GO
ALTER TABLE [dbo].[user]  WITH CHECK ADD  CONSTRAINT [user_school_id_fk] FOREIGN KEY([school_id])
REFERENCES [dbo].[school] ([id])
GO
ALTER TABLE [dbo].[user] CHECK CONSTRAINT [user_school_id_fk]
GO
