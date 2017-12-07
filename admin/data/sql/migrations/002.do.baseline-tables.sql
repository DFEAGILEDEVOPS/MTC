/*
Description: MTC Baseline Script
Author: Guy Harwood
Date: 23/11/2017 12:32
*/
/****** Object:  Table [admin].[adminLogonEvent]    Script Date: 23/11/2017 17:14:08 ******/

SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [admin].[adminLogonEvent]
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
/****** Object:  Table [admin].[attendanceCode]    Script Date: 23/11/2017 17:14:08 ******/
CREATE TABLE [admin].[attendanceCode]
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
/****** Object:  Table [admin].[check]    Script Date: 23/11/2017 17:14:08 ******/
CREATE TABLE [admin].[check]
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
/****** Object:  Table [admin].[checkForm]    Script Date: 23/11/2017 17:14:08 ******/
CREATE TABLE [admin].[checkForm]
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
/****** Object:  Table [admin].[checkWindow]    Script Date: 23/11/2017 17:14:08 ******/
CREATE TABLE [admin].[checkWindow]
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
/****** Object:  Table [admin].[hdf]    Script Date: 23/11/2017 17:14:08 ******/
CREATE TABLE [admin].[hdf]
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
/****** Object:  Table [admin].[pupil]    Script Date: 23/11/2017 17:14:08 ******/
CREATE TABLE [admin].[pupil]
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
/****** Object:  Table [admin].[pupilAttendance]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [admin].[pupilAttendance]
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
/****** Object:  Table [admin].[pupilFeedback]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [admin].[pupilFeedback]
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
/****** Object:  Table [admin].[pupilLogonEvent]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [admin].[pupilLogonEvent]
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
/****** Object:  Table [admin].[question]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [admin].[question]
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
/****** Object:  Table [admin].[role]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [admin].[role]
(
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetime2](7) NOT NULL,
	[updatedAt] [datetime2](7) NOT NULL,
	[version] [rowversion],
	[title] [nvarchar](max) NOT NULL,
	CONSTRAINT [PK_role] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)
/****** Object:  Table [admin].[school]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [admin].[school]
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
/****** Object:  Table [admin].[settings]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [admin].[settings]
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
/****** Object:  Table [admin].[settingsLog]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [admin].[settingsLog]
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
/****** Object:  Table [admin].[user]    Script Date: 23/11/2017 17:14:09 ******/
CREATE TABLE [admin].[user]
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
CREATE UNIQUE NONCLUSTERED INDEX [attendanceCode_code_uindex] ON [admin].[attendanceCode]
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
/****** Object:  Index [pupil_upn_uindex]    Script Date: 23/11/2017 17:14:09 ******/
CREATE UNIQUE NONCLUSTERED INDEX [pupil_upn_uindex] ON [admin].[pupil]
(
	[upn] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)

-- Defaults
ALTER TABLE [admin].[adminLogonEvent] ADD  CONSTRAINT [DF_adminLogonEvent_createdAt_default]  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [admin].[adminLogonEvent] ADD  CONSTRAINT [DF_adminLogonEvent_updatedAt_default]  DEFAULT (GETUTCDATE()) FOR [updatedAt]

ALTER TABLE [admin].[attendanceCode] ADD  CONSTRAINT [DF_attendanceCode_createdAt_default]  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [admin].[attendanceCode] ADD  CONSTRAINT [DF_attendanceCode_updatedAt_default]  DEFAULT (GETUTCDATE()) FOR [updatedAt]

ALTER TABLE [admin].[check] ADD  CONSTRAINT [DF_check_createdAt_default]  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [admin].[check] ADD  CONSTRAINT [DF_check_updatedAt_default]  DEFAULT (GETUTCDATE()) FOR [updatedAt]
ALTER TABLE [admin].[check] ADD  CONSTRAINT [DF_check_checkCode_default]  DEFAULT (newid()) FOR [checkCode]

ALTER TABLE [admin].[checkForm] ADD  CONSTRAINT [DF_checkForm_createdAt_default]  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [admin].[checkForm] ADD  CONSTRAINT [DF_checkForm_updatedAt_default]  DEFAULT (GETUTCDATE()) FOR [updatedAt]
ALTER TABLE [admin].[checkForm] ADD  CONSTRAINT [DF_checkForm_isDeleted_default]  DEFAULT ((0)) FOR [isDeleted]

ALTER TABLE [admin].[checkWindow] ADD  DEFAULT ((0)) FOR [isDeleted]
ALTER TABLE [admin].[checkWindow] ADD  CONSTRAINT [DF_checkWindow_createdAt_default]  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [admin].[checkWindow] ADD  CONSTRAINT [DF_checkWindow_updatedAt_default]  DEFAULT (GETUTCDATE()) FOR [updatedAt]

ALTER TABLE [admin].[hdf] ADD  CONSTRAINT [DF_hdf_createdAt_default]  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [admin].[hdf] ADD  CONSTRAINT [DF_hdf_updatedAt_default]  DEFAULT (GETUTCDATE()) FOR [updatedAt]
ALTER TABLE [admin].[hdf] ADD  CONSTRAINT [DF_hdf_signedDate_default]  DEFAULT (GETUTCDATE()) FOR [signedDate]

ALTER TABLE [admin].[pupil] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [admin].[pupil] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]
ALTER TABLE [admin].[pupil] ADD  DEFAULT ((0)) FOR [speechSynthesis]
ALTER TABLE [admin].[pupil] ADD  DEFAULT ((0)) FOR [isTestAccount]
ALTER TABLE [admin].[pupil] ADD  DEFAULT (newid()) FOR [urlSlug]

ALTER TABLE [admin].[pupilAttendance] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [admin].[pupilAttendance] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]

ALTER TABLE [admin].[pupilFeedback] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [admin].[pupilFeedback] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]

ALTER TABLE [admin].[pupilLogonEvent] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [admin].[pupilLogonEvent] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]

ALTER TABLE [admin].[question] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]
ALTER TABLE [admin].[question] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]

ALTER TABLE [admin].[role] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]
ALTER TABLE [admin].[role] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]

ALTER TABLE [admin].[school] ADD  CONSTRAINT [DF_school_createdAt_default]  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [admin].[school] ADD  CONSTRAINT [DF_school_updatedAt_default]  DEFAULT (GETUTCDATE()) FOR [updatedAt]
ALTER TABLE [admin].[school] ADD  DEFAULT (newid()) FOR [urlSlug]

ALTER TABLE [admin].[settings] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [admin].[settings] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]

ALTER TABLE [admin].[settingsLog] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [admin].[settingsLog] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]

ALTER TABLE [admin].[user] ADD  DEFAULT (GETUTCDATE()) FOR [createdAt]
ALTER TABLE [admin].[user] ADD  DEFAULT (GETUTCDATE()) FOR [updatedAt]

-- Foreign Keys
ALTER TABLE [admin].[adminLogonEvent]  WITH CHECK ADD  CONSTRAINT [FK_adminLogonEvent_user_id] FOREIGN KEY([user_id])
REFERENCES [admin].[user] ([id])
ALTER TABLE [admin].[adminLogonEvent] CHECK CONSTRAINT [FK_adminLogonEvent_user_id]
ALTER TABLE [admin].[check]  WITH CHECK ADD  CONSTRAINT [FK_check_checkForm_id] FOREIGN KEY([checkForm_id])
REFERENCES [admin].[checkForm] ([id])
ALTER TABLE [admin].[check] CHECK CONSTRAINT [FK_check_checkForm_id]
ALTER TABLE [admin].[check]  WITH CHECK ADD  CONSTRAINT [FK_check_checkWindow_id] FOREIGN KEY([checkWindow_id])
REFERENCES [admin].[checkWindow] ([id])
ALTER TABLE [admin].[check] CHECK CONSTRAINT [FK_check_checkWindow_id]
ALTER TABLE [admin].[check]  WITH CHECK ADD  CONSTRAINT [FK_check_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [admin].[pupil] ([id])
ALTER TABLE [admin].[check] CHECK CONSTRAINT [FK_check_pupil_id]
ALTER TABLE [admin].[checkForm]  WITH CHECK ADD  CONSTRAINT [FK_checkForm_checkWindow_id] FOREIGN KEY([checkWindow_id])
REFERENCES [admin].[checkWindow] ([id])
ALTER TABLE [admin].[checkForm] CHECK CONSTRAINT [FK_checkForm_checkWindow_id]
ALTER TABLE [admin].[hdf]  WITH CHECK ADD  CONSTRAINT [FK_hdf_checkWindow_id] FOREIGN KEY([checkWindow_id])
REFERENCES [admin].[checkWindow] ([id])
ALTER TABLE [admin].[hdf] CHECK CONSTRAINT [FK_hdf_checkWindow_id]
ALTER TABLE [admin].[hdf]  WITH CHECK ADD  CONSTRAINT [FK_hdf_school_id] FOREIGN KEY([school_id])
REFERENCES [admin].[school] ([id])
ALTER TABLE [admin].[hdf] CHECK CONSTRAINT [FK_hdf_school_id]
ALTER TABLE [admin].[hdf]  WITH CHECK ADD  CONSTRAINT [FK_hdf_user_id] FOREIGN KEY([user_id])
REFERENCES [admin].[user] ([id])
ALTER TABLE [admin].[hdf] CHECK CONSTRAINT [FK_hdf_user_id]
ALTER TABLE [admin].[pupil]  WITH CHECK ADD  CONSTRAINT [FK_pupil_school_id] FOREIGN KEY([school_id])
REFERENCES [admin].[school] ([id])
ALTER TABLE [admin].[pupil] CHECK CONSTRAINT [FK_pupil_school_id]
ALTER TABLE [admin].[pupilAttendance]  WITH CHECK ADD  CONSTRAINT [FK_pupilAttendance_attendanceCode_id] FOREIGN KEY([attendanceCode_id])
REFERENCES [admin].[attendanceCode] ([id])
ALTER TABLE [admin].[pupilAttendance] CHECK CONSTRAINT [FK_pupilAttendance_attendanceCode_id]
ALTER TABLE [admin].[pupilAttendance]  WITH CHECK ADD  CONSTRAINT [FK_pupilAttendance_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [admin].[pupil] ([id])
ALTER TABLE [admin].[pupilAttendance] CHECK CONSTRAINT [FK_pupilAttendance_pupil_id]
ALTER TABLE [admin].[pupilAttendance]  WITH CHECK ADD  CONSTRAINT [FK_pupilAttendance_user_id] FOREIGN KEY([recordedBy_user_id])
REFERENCES [admin].[user] ([id])
ALTER TABLE [admin].[pupilAttendance] CHECK CONSTRAINT [FK_pupilAttendance_user_id]
ALTER TABLE [admin].[pupilFeedback]  WITH CHECK ADD  CONSTRAINT [FK_pupilFeedback_check_id] FOREIGN KEY([check_id])
REFERENCES [admin].[check] ([id])
ALTER TABLE [admin].[pupilFeedback] CHECK CONSTRAINT [FK_pupilFeedback_check_id]
ALTER TABLE [admin].[pupilLogonEvent]  WITH CHECK ADD  CONSTRAINT [FK_pupilLogonEvent_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [admin].[pupil] ([id])
ALTER TABLE [admin].[pupilLogonEvent] CHECK CONSTRAINT [FK_pupilLogonEvent_pupil_id]
ALTER TABLE [admin].[question]  WITH CHECK ADD  CONSTRAINT [FK_question_checkForm_id] FOREIGN KEY([checkForm_id])
REFERENCES [admin].[checkForm] ([id])
ALTER TABLE [admin].[question] CHECK CONSTRAINT [FK_question_checkForm_id]
ALTER TABLE [admin].[settingsLog]  WITH CHECK ADD  CONSTRAINT [FK_settingsLog_user_id] FOREIGN KEY([user_id])
REFERENCES [admin].[user] ([id])
ALTER TABLE [admin].[settingsLog] CHECK CONSTRAINT [FK_settingsLog_user_id]
ALTER TABLE [admin].[user]  WITH CHECK ADD  CONSTRAINT [FK_user_role_id] FOREIGN KEY([role_id])
REFERENCES [admin].[role] ([id])
ALTER TABLE [admin].[user] CHECK CONSTRAINT [FK_user_role_id]
ALTER TABLE [admin].[user]  WITH CHECK ADD  CONSTRAINT [FK_user_school_id] FOREIGN KEY([school_id])
REFERENCES [admin].[school] ([id])
ALTER TABLE [admin].[user] CHECK CONSTRAINT [FK_user_school_id]
