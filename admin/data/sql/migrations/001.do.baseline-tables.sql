/*
Description: MTC Baseline Script
Author: Guy Harwood
Date: 23/11/2017 12:32
*/
/****** Object:  Table [dbo].[adminLogonEvent]    Script Date: 23/11/2017 17:14:08 ******/
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[adminLogonEvent]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
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
/****** Object:  Table [dbo].[attendanceCode]    Script Date: 23/11/2017 17:14:08 ******/
CREATE TABLE [dbo].[attendanceCode]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
	[reason] [nvarchar](50) NOT NULL,
	[order] [tinyint] NOT NULL,
	[code] [char](5) NOT NULL,
	CONSTRAINT [PK_attendanceCode] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)
/****** Object:  Table [dbo].[check]    Script Date: 23/11/2017 17:14:08 ******/
CREATE TABLE [dbo].[check]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
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
/****** Object:  Table [dbo].[checkForm]    Script Date: 23/11/2017 17:14:08 ******/
CREATE TABLE [dbo].[checkForm]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
	[name] [nvarchar](max) NOT NULL,
	[isDeleted] [bit] NOT NULL,
	[checkWindow_id] [int] NULL,
	CONSTRAINT [PK_checkForm] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)
/****** Object:  Table [dbo].[checkWindow]    Script Date: 23/11/2017 17:14:08 ******/
CREATE TABLE [dbo].[checkWindow]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
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
/****** Object:  Table [dbo].[hdf]    Script Date: 23/11/2017 17:14:08 ******/
CREATE TABLE [dbo].[hdf]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
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
/****** Object:  Table [dbo].[pupil]    Script Date: 23/11/2017 17:14:08 ******/
CREATE TABLE [dbo].[pupil]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
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
/****** Object:  Table [dbo].[pupilAttendance]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [dbo].[pupilAttendance]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
	[recordedBy_user_id] [int] NOT NULL,
	[attendanceCode_id] [int] NOT NULL,
	[pupil_id] [int] NOT NULL,
	CONSTRAINT [PK_pupilAttendance] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)
/****** Object:  Table [dbo].[pupilFeedback]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [dbo].[pupilFeedback]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
	[inputType] [int] NOT NULL,
	[satisfactionRating] [tinyint] NULL,
	[comments] [nvarchar](max) NULL,
	[check_id] [int] NULL,
	PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)
/****** Object:  Table [dbo].[pupilLogonEvent]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [dbo].[pupilLogonEvent]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
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
/****** Object:  Table [dbo].[question]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [dbo].[question]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
	[factor1] [tinyint] NOT NULL,
	[factor2] [tinyint] NOT NULL,
	[order] [tinyint] NOT NULL,
	[checkForm_id] [int] NULL,
	CONSTRAINT [PK_question] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)
/****** Object:  Table [dbo].[role]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [dbo].[role]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
	[role] [nvarchar](max) NOT NULL,
	CONSTRAINT [PK_role] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)
/****** Object:  Table [dbo].[school]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [dbo].[school]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
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
/****** Object:  Table [dbo].[settings]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [dbo].[settings]
(
	[id] [tinyint] NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
	[loadingTimeLimit] [tinyint] NOT NULL,
	[questionTimeLimit] [tinyint] NOT NULL,
	PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)
/****** Object:  Table [dbo].[settingsLog]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [dbo].[settingsLog]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
	[loadingTimeLimit] [tinyint] NOT NULL,
	[questionTimeLimit] [tinyint] NOT NULL,
	[user_id] [int] NULL,
	PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)
/****** Object:  Table [dbo].[user]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [dbo].[user]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
	[identifier] [nvarchar](max) NOT NULL,
	[passwordHash] [nvarchar](max) NULL,
	[school_id] [int] NOT NULL,
	[role_id] [int] NOT NULL,
	CONSTRAINT [PK_user] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)
SET ANSI_PADDING ON

-- Indexes
/****** Object:  Index [attendanceCode_code_uindex]    Script Date: 23/11/2017 17:14:09 ******/
CREATE UNIQUE NONCLUSTERED INDEX [attendanceCode_code_uindex] ON [dbo].[attendanceCode]
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
/****** Object:  Index [pupil_upn_uindex]    Script Date: 23/11/2017 17:14:09 ******/
CREATE UNIQUE NONCLUSTERED INDEX [pupil_upn_uindex] ON [dbo].[pupil]
(
	[upn] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)

-- Defaults
ALTER TABLE [dbo].[adminLogonEvent] ADD  CONSTRAINT [DF_adminLogonEvent_createdAt_default]  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [dbo].[adminLogonEvent] ADD  CONSTRAINT [DF_adminLogonEvent_updatedAt_default]  DEFAULT (GETUTCDATE()) FOR [updatedAt]

ALTER TABLE [dbo].[attendanceCode] ADD  CONSTRAINT [DF_attendanceCode_createdAt_default]  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [dbo].[attendanceCode] ADD  CONSTRAINT [DF_attendanceCode_updatedAt_default]  DEFAULT (GETUTCDATE()) FOR [updatedAt]

ALTER TABLE [dbo].[check] ADD  CONSTRAINT [DF_check_createdAt_default]  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [dbo].[check] ADD  CONSTRAINT [DF_check_updatedAt_default]  DEFAULT (GETUTCDATE()) FOR [updatedAt]
ALTER TABLE [dbo].[check] ADD  CONSTRAINT [DF_check_checkCode_default]  DEFAULT (newid()) FOR [checkCode]

ALTER TABLE [dbo].[checkForm] ADD  CONSTRAINT [DF_checkForm_createdAt_default]  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [dbo].[checkForm] ADD  CONSTRAINT [DF_checkForm_updatedAt_default]  DEFAULT (GETUTCDATE()) FOR [updatedAt]
ALTER TABLE [dbo].[checkForm] ADD  CONSTRAINT [DF_checkForm_isDeleted_default]  DEFAULT ((0)) FOR [isDeleted]

ALTER TABLE [dbo].[checkWindow] ADD  DEFAULT ((0)) FOR [isDeleted]
ALTER TABLE [dbo].[checkWindow] ADD  CONSTRAINT [DF_checkWindow_createdAt_default]  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [dbo].[checkWindow] ADD  CONSTRAINT [DF_checkWindow_updatedAt_default]  DEFAULT (GETUTCDATE()) FOR [updatedAt]

ALTER TABLE [dbo].[hdf] ADD  CONSTRAINT [DF_hdf_createdAt_default]  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [dbo].[hdf] ADD  CONSTRAINT [DF_hdf_updatedAt_default]  DEFAULT (GETUTCDATE()) FOR [updatedAt]
ALTER TABLE [dbo].[hdf] ADD  CONSTRAINT [DF_hdf_signedDate_default]  DEFAULT (GETUTCDATE()) FOR [signedDate]

ALTER TABLE [dbo].[pupil] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [dbo].[pupil] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]
ALTER TABLE [dbo].[pupil] ADD  DEFAULT ((0)) FOR [speechSynthesis]
ALTER TABLE [dbo].[pupil] ADD  DEFAULT ((0)) FOR [isTestAccount]
ALTER TABLE [dbo].[pupil] ADD  DEFAULT (newid()) FOR [urlSlug]

ALTER TABLE [dbo].[pupilAttendance] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [dbo].[pupilAttendance] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]

ALTER TABLE [dbo].[pupilFeedback] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [dbo].[pupilFeedback] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]

ALTER TABLE [dbo].[pupilLogonEvent] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [dbo].[pupilLogonEvent] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]

ALTER TABLE [dbo].[question] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]
ALTER TABLE [dbo].[question] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]

ALTER TABLE [dbo].[role] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]
ALTER TABLE [dbo].[role] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]

ALTER TABLE [dbo].[school] ADD  CONSTRAINT [DF_school_createdAt_default]  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [dbo].[school] ADD  CONSTRAINT [DF_school_updatedAt_default]  DEFAULT (GETUTCDATE()) FOR [updatedAt]
ALTER TABLE [dbo].[school] ADD  DEFAULT (newid()) FOR [urlSlug]

ALTER TABLE [dbo].[settings] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [dbo].[settings] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]

ALTER TABLE [dbo].[settingsLog] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [dbo].[settingsLog] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]

ALTER TABLE [dbo].[user] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [dbo].[user] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]

-- Foreign Keys
ALTER TABLE [dbo].[adminLogonEvent]  WITH CHECK ADD  CONSTRAINT [FK_adminLogonEvent_user_id] FOREIGN KEY([user_id])
REFERENCES [dbo].[user] ([id])
ALTER TABLE [dbo].[adminLogonEvent] CHECK CONSTRAINT [FK_adminLogonEvent_user_id]
ALTER TABLE [dbo].[check]  WITH CHECK ADD  CONSTRAINT [FK_check_checkForm_id] FOREIGN KEY([checkForm_id])
REFERENCES [dbo].[checkForm] ([id])
ALTER TABLE [dbo].[check] CHECK CONSTRAINT [FK_check_checkForm_id]
ALTER TABLE [dbo].[check]  WITH CHECK ADD  CONSTRAINT [FK_check_checkWindow_id] FOREIGN KEY([checkWindow_id])
REFERENCES [dbo].[checkWindow] ([id])
ALTER TABLE [dbo].[check] CHECK CONSTRAINT [FK_check_checkWindow_id]
ALTER TABLE [dbo].[check]  WITH CHECK ADD  CONSTRAINT [FK_check_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [dbo].[pupil] ([id])
ALTER TABLE [dbo].[check] CHECK CONSTRAINT [FK_check_pupil_id]
ALTER TABLE [dbo].[checkForm]  WITH CHECK ADD  CONSTRAINT [FK_checkForm_checkWindow_id] FOREIGN KEY([checkWindow_id])
REFERENCES [dbo].[checkWindow] ([id])
ALTER TABLE [dbo].[checkForm] CHECK CONSTRAINT [FK_checkForm_checkWindow_id]
ALTER TABLE [dbo].[hdf]  WITH CHECK ADD  CONSTRAINT [FK_hdf_checkWindow_id] FOREIGN KEY([checkWindow_id])
REFERENCES [dbo].[checkWindow] ([id])
ALTER TABLE [dbo].[hdf] CHECK CONSTRAINT [FK_hdf_checkWindow_id]
ALTER TABLE [dbo].[hdf]  WITH CHECK ADD  CONSTRAINT [FK_hdf_school_id] FOREIGN KEY([school_id])
REFERENCES [dbo].[school] ([id])
ALTER TABLE [dbo].[hdf] CHECK CONSTRAINT [FK_hdf_school_id]
ALTER TABLE [dbo].[hdf]  WITH CHECK ADD  CONSTRAINT [FK_hdf_user_id] FOREIGN KEY([user_id])
REFERENCES [dbo].[user] ([id])
ALTER TABLE [dbo].[hdf] CHECK CONSTRAINT [FK_hdf_user_id]
ALTER TABLE [dbo].[pupil]  WITH CHECK ADD  CONSTRAINT [FK_pupil_school_id] FOREIGN KEY([school_id])
REFERENCES [dbo].[school] ([id])
ALTER TABLE [dbo].[pupil] CHECK CONSTRAINT [FK_pupil_school_id]
ALTER TABLE [dbo].[pupilAttendance]  WITH CHECK ADD  CONSTRAINT [FK_pupilAttendance_attendanceCode_id] FOREIGN KEY([attendanceCode_id])
REFERENCES [dbo].[attendanceCode] ([id])
ALTER TABLE [dbo].[pupilAttendance] CHECK CONSTRAINT [FK_pupilAttendance_attendanceCode_id]
ALTER TABLE [dbo].[pupilAttendance]  WITH CHECK ADD  CONSTRAINT [FK_pupilAttendance_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [dbo].[pupil] ([id])
ALTER TABLE [dbo].[pupilAttendance] CHECK CONSTRAINT [FK_pupilAttendance_pupil_id]
ALTER TABLE [dbo].[pupilAttendance]  WITH CHECK ADD  CONSTRAINT [FK_pupilAttendance_user_id] FOREIGN KEY([recordedBy_user_id])
REFERENCES [dbo].[user] ([id])
ALTER TABLE [dbo].[pupilAttendance] CHECK CONSTRAINT [FK_pupilAttendance_user_id]
ALTER TABLE [dbo].[pupilFeedback]  WITH CHECK ADD  CONSTRAINT [FK_pupilFeedback_check_id] FOREIGN KEY([check_id])
REFERENCES [dbo].[check] ([id])
ALTER TABLE [dbo].[pupilFeedback] CHECK CONSTRAINT [FK_pupilFeedback_check_id]
ALTER TABLE [dbo].[pupilLogonEvent]  WITH CHECK ADD  CONSTRAINT [FK_pupilLogonEvent_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [dbo].[pupil] ([id])
ALTER TABLE [dbo].[pupilLogonEvent] CHECK CONSTRAINT [FK_pupilLogonEvent_pupil_id]
ALTER TABLE [dbo].[question]  WITH CHECK ADD  CONSTRAINT [FK_question_checkForm_id] FOREIGN KEY([checkForm_id])
REFERENCES [dbo].[checkForm] ([id])
ALTER TABLE [dbo].[question] CHECK CONSTRAINT [FK_question_checkForm_id]
ALTER TABLE [dbo].[settingsLog]  WITH CHECK ADD  CONSTRAINT [FK_settingsLog_user_id] FOREIGN KEY([user_id])
REFERENCES [dbo].[user] ([id])
ALTER TABLE [dbo].[settingsLog] CHECK CONSTRAINT [FK_settingsLog_user_id]
ALTER TABLE [dbo].[user]  WITH CHECK ADD  CONSTRAINT [FK_user_role_id] FOREIGN KEY([role_id])
REFERENCES [dbo].[role] ([id])
ALTER TABLE [dbo].[user] CHECK CONSTRAINT [FK_user_role_id]
ALTER TABLE [dbo].[user]  WITH CHECK ADD  CONSTRAINT [FK_user_school_id] FOREIGN KEY([school_id])
REFERENCES [dbo].[school] ([id])
ALTER TABLE [dbo].[user] CHECK CONSTRAINT [FK_user_school_id]
