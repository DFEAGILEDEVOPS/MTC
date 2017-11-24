/*
Description: MTC Baseline Script
Index: 0
Author: Guy Harwood
Date: 23/11/2017 12:32
*/

CREATE DATABASE [mtc]
GO

USE [mtc]
GO
/****** Object:  Table [dbo].[adminLogonEvent]    Script Date: 23/11/2017 17:14:08 ******/
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
/****** Object:  Table [dbo].[attendanceCode]    Script Date: 23/11/2017 17:14:08 ******/
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
	[code] [char](5) NOT NULL,
 CONSTRAINT [PK_attendanceCode] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[check]    Script Date: 23/11/2017 17:14:08 ******/
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
	[mark] [tinyint] NULL,
	[maxMark] [tinyint] NULL,
	[markedAt] [datetime2](7) NULL,
 CONSTRAINT [PK_check] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[checkForm]    Script Date: 23/11/2017 17:14:08 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[checkForm](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NULL,
	[name] [nvarchar](max) NOT NULL,
	[isDeleted] [bit] NOT NULL,
	[checkWindow_id] [int] NULL,
 CONSTRAINT [PK_checkForm] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[checkWindow]    Script Date: 23/11/2017 17:14:08 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[checkWindow](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](max) NOT NULL,
	[adminStartDate] [datetime2](7) NOT NULL,
	[checkStartDate] [datetime2](7) NOT NULL,
	[checkEndDate] [datetime2](7) NOT NULL,
	[isDeleted] [bit] NOT NULL,
 CONSTRAINT [PK_checkWindow] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[dbMigrationLog]    Script Date: 23/11/2017 17:14:08 ******/
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
/****** Object:  Table [dbo].[hdf]    Script Date: 23/11/2017 17:14:08 ******/
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
	[checkWindow_id] [int] NOT NULL,
 CONSTRAINT [PK_hdf] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[pupil]    Script Date: 23/11/2017 17:14:08 ******/
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
	[isTestAccount] [bit] NOT NULL,
	[urlSlug] [uniqueidentifier] NOT NULL,
	[token] [nvarchar](max) NULL,
 CONSTRAINT [PK_pupil] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[pupilAttendance]    Script Date: 23/11/2017 17:14:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[pupilAttendance](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NULL,
	[recordedBy_user_id] [int] NOT NULL,
	[attendanceCode_id] [int] NOT NULL,
	[pupil_id] [int] NOT NULL,
 CONSTRAINT [PK_pupilAttendance] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[pupilFeedback]    Script Date: 23/11/2017 17:14:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[pupilFeedback](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[inputType] [int] NOT NULL,
	[satisfactionRating] [tinyint] NULL,
	[comments] [nvarchar](max) NULL,
	[check_id] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[pupilLogonEvent]    Script Date: 23/11/2017 17:14:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[pupilLogonEvent](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[pupil_id] [int] NULL,
	[isAuthenticated] [bit] NOT NULL,
	[pupilPin] [char](5) NOT NULL,
	[schoolPin] [char](8) NOT NULL,
	[httpStatusCode] [smallint] NULL,
	[httpErrorMessage] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[question]    Script Date: 23/11/2017 17:14:09 ******/
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
/****** Object:  Table [dbo].[role]    Script Date: 23/11/2017 17:14:09 ******/
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
/****** Object:  Table [dbo].[school]    Script Date: 23/11/2017 17:14:09 ******/
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
	[pin] [char](8) NULL,
	[pinExpiresAt] [datetime2](7) NULL,
	[urlSlug] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_school] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[settings]    Script Date: 23/11/2017 17:14:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[settings](
	[id] [tinyint] NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NULL,
	[loadingTimeLimit] [tinyint] NOT NULL,
	[questionTimeLimit] [tinyint] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[settingsLog]    Script Date: 23/11/2017 17:14:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[settingsLog](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[loadingTimeLimit] [tinyint] NOT NULL,
	[questionTimeLimit] [tinyint] NOT NULL,
	[user_id] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
/****** Object:  Table [dbo].[user]    Script Date: 23/11/2017 17:14:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[user](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NULL,
	[identifier] [nvarchar](max) NOT NULL,
	[passwordHash] [nvarchar](max) NULL,
	[school_id] [int] NOT NULL,
	[role_id] [int] NOT NULL,
 CONSTRAINT [PK_user] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
SET ANSI_PADDING ON

GO

-- Indexes

/****** Object:  Index [attendanceCode_code_uindex]    Script Date: 23/11/2017 17:14:09 ******/
CREATE UNIQUE NONCLUSTERED INDEX [attendanceCode_code_uindex] ON [dbo].[attendanceCode]
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [pupil_upn_uindex]    Script Date: 23/11/2017 17:14:09 ******/
CREATE UNIQUE NONCLUSTERED INDEX [pupil_upn_uindex] ON [dbo].[pupil]
(
	[upn] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
GO

-- Defaults

ALTER TABLE [dbo].[adminLogonEvent] ADD  CONSTRAINT [DF_adminLogonEvent_createdAt_default]  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[attendanceCode] ADD  CONSTRAINT [DF_attendanceCode_createdAt_default]  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[check] ADD  CONSTRAINT [DF_check_createdAt_default]  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[check] ADD  CONSTRAINT [DF_check_checkCode_default]  DEFAULT (newid()) FOR [checkCode]
GO
ALTER TABLE [dbo].[checkForm] ADD  CONSTRAINT [DF_checkForm_createdAt_default]  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[checkForm] ADD  CONSTRAINT [DF_checkForm_isDeleted_default]  DEFAULT ((0)) FOR [isDeleted]
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
ALTER TABLE [dbo].[pupil] ADD  DEFAULT ((0)) FOR [isTestAccount]
GO
ALTER TABLE [dbo].[pupil] ADD  DEFAULT (newid()) FOR [urlSlug]
GO
ALTER TABLE [dbo].[pupilAttendance] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[pupilFeedback] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[pupilLogonEvent] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[school] ADD  CONSTRAINT [DF_school_createdAt_default]  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[school] ADD  DEFAULT (newid()) FOR [urlSlug]
GO
ALTER TABLE [dbo].[settings] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[settingsLog] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[user] ADD  DEFAULT (getdate()) FOR [createdAt]
GO

-- Foreign Keys

ALTER TABLE [dbo].[adminLogonEvent]  WITH CHECK ADD  CONSTRAINT [FK_adminLogonEvent_user_id] FOREIGN KEY([user_id])
REFERENCES [dbo].[user] ([id])
GO
ALTER TABLE [dbo].[adminLogonEvent] CHECK CONSTRAINT [FK_adminLogonEvent_user_id]
GO
ALTER TABLE [dbo].[check]  WITH CHECK ADD  CONSTRAINT [FK_check_checkForm_id] FOREIGN KEY([checkForm_id])
REFERENCES [dbo].[checkForm] ([id])
GO
ALTER TABLE [dbo].[check] CHECK CONSTRAINT [FK_check_checkForm_id]
GO
ALTER TABLE [dbo].[check]  WITH CHECK ADD  CONSTRAINT [FK_check_checkWindow_id] FOREIGN KEY([checkWindow_id])
REFERENCES [dbo].[checkWindow] ([id])
GO
ALTER TABLE [dbo].[check] CHECK CONSTRAINT [FK_check_checkWindow_id]
GO
ALTER TABLE [dbo].[check]  WITH CHECK ADD  CONSTRAINT [FK_check_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [dbo].[pupil] ([id])
GO
ALTER TABLE [dbo].[check] CHECK CONSTRAINT [FK_check_pupil_id]
GO
ALTER TABLE [dbo].[checkForm]  WITH CHECK ADD  CONSTRAINT [FK_checkForm_checkWindow_id] FOREIGN KEY([checkWindow_id])
REFERENCES [dbo].[checkWindow] ([id])
GO
ALTER TABLE [dbo].[checkForm] CHECK CONSTRAINT [FK_checkForm_checkWindow_id]
GO
ALTER TABLE [dbo].[hdf]  WITH CHECK ADD  CONSTRAINT [FK_hdf_checkWindow_id] FOREIGN KEY([checkWindow_id])
REFERENCES [dbo].[checkWindow] ([id])
GO
ALTER TABLE [dbo].[hdf] CHECK CONSTRAINT [FK_hdf_checkWindow_id]
GO
ALTER TABLE [dbo].[hdf]  WITH CHECK ADD  CONSTRAINT [FK_hdf_school_id] FOREIGN KEY([school_id])
REFERENCES [dbo].[school] ([id])
GO
ALTER TABLE [dbo].[hdf] CHECK CONSTRAINT [FK_hdf_school_id]
GO
ALTER TABLE [dbo].[hdf]  WITH CHECK ADD  CONSTRAINT [FK_hdf_user_id] FOREIGN KEY([user_id])
REFERENCES [dbo].[user] ([id])
GO
ALTER TABLE [dbo].[hdf] CHECK CONSTRAINT [FK_hdf_user_id]
GO
ALTER TABLE [dbo].[pupil]  WITH CHECK ADD  CONSTRAINT [FK_pupil_school_id] FOREIGN KEY([school_id])
REFERENCES [dbo].[school] ([id])
GO
ALTER TABLE [dbo].[pupil] CHECK CONSTRAINT [FK_pupil_school_id]
GO
ALTER TABLE [dbo].[pupilAttendance]  WITH CHECK ADD  CONSTRAINT [FK_pupilAttendance_attendanceCode_id] FOREIGN KEY([attendanceCode_id])
REFERENCES [dbo].[attendanceCode] ([id])
GO
ALTER TABLE [dbo].[pupilAttendance] CHECK CONSTRAINT [FK_pupilAttendance_attendanceCode_id]
GO
ALTER TABLE [dbo].[pupilAttendance]  WITH CHECK ADD  CONSTRAINT [FK_pupilAttendance_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [dbo].[pupil] ([id])
GO
ALTER TABLE [dbo].[pupilAttendance] CHECK CONSTRAINT [FK_pupilAttendance_pupil_id]
GO
ALTER TABLE [dbo].[pupilAttendance]  WITH CHECK ADD  CONSTRAINT [FK_pupilAttendance_user_id] FOREIGN KEY([recordedBy_user_id])
REFERENCES [dbo].[user] ([id])
GO
ALTER TABLE [dbo].[pupilAttendance] CHECK CONSTRAINT [FK_pupilAttendance_user_id]
GO
ALTER TABLE [dbo].[pupilFeedback]  WITH CHECK ADD  CONSTRAINT [FK_pupilFeedback_check_id] FOREIGN KEY([check_id])
REFERENCES [dbo].[check] ([id])
GO
ALTER TABLE [dbo].[pupilFeedback] CHECK CONSTRAINT [FK_pupilFeedback_check_id]
GO
ALTER TABLE [dbo].[pupilLogonEvent]  WITH CHECK ADD  CONSTRAINT [FK_pupilLogonEvent_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [dbo].[pupil] ([id])
GO
ALTER TABLE [dbo].[pupilLogonEvent] CHECK CONSTRAINT [FK_pupilLogonEvent_pupil_id]
GO
ALTER TABLE [dbo].[question]  WITH CHECK ADD  CONSTRAINT [FK_question_checkForm_id] FOREIGN KEY([checkForm_id])
REFERENCES [dbo].[checkForm] ([id])
GO
ALTER TABLE [dbo].[question] CHECK CONSTRAINT [FK_question_checkForm_id]
GO
ALTER TABLE [dbo].[settingsLog]  WITH CHECK ADD  CONSTRAINT [FK_settingsLog_user_id] FOREIGN KEY([user_id])
REFERENCES [dbo].[user] ([id])
GO
ALTER TABLE [dbo].[settingsLog] CHECK CONSTRAINT [FK_settingsLog_user_id]
GO
ALTER TABLE [dbo].[user]  WITH CHECK ADD  CONSTRAINT [FK_user_role_id] FOREIGN KEY([role_id])
REFERENCES [dbo].[role] ([id])
GO
ALTER TABLE [dbo].[user] CHECK CONSTRAINT [FK_user_role_id]
GO
ALTER TABLE [dbo].[user]  WITH CHECK ADD  CONSTRAINT [FK_user_school_id] FOREIGN KEY([school_id])
REFERENCES [dbo].[school] ([id])
GO
ALTER TABLE [dbo].[user] CHECK CONSTRAINT [FK_user_school_id]
GO
