
/****** Object:  UserDefinedTableType [mtc_admin].[checkTableType]    Script Date: 29/10/2020 17:26:24 ******/
CREATE TYPE [mtc_admin].[checkTableType] AS TABLE(
	[pupil_id] [int] NULL,
	[checkForm_id] [int] NULL,
	[checkWindow_id] [int] NULL,
	[isLiveCheck] [bit] NULL,
	[pinExpiresAt] [datetimeoffset](3) NULL,
	[school_id] [int] NULL,
	[createdBy_userId] [int] NULL
)
GO
/****** Object:  UserDefinedTableType [mtc_admin].[SceTableType]    Script Date: 29/10/2020 17:26:24 ******/
CREATE TYPE [mtc_admin].[SceTableType] AS TABLE(
	[school_id] [int] NULL,
	[timezone] [nvarchar](200) NULL,
	[countryCode] [char](2) NULL,
	[isOpen] [bit] NULL
)
GO
/****** Object:  UserDefinedTableType [mtc_census_import].[censusImportTableType]    Script Date: 29/10/2020 17:26:24 ******/
CREATE TYPE [mtc_census_import].[censusImportTableType] AS TABLE(
	[id] [int] NULL,
	[lea] [nvarchar](max) NULL,
	[estab] [nvarchar](max) NULL,
	[upn] [nvarchar](max) NULL,
	[surname] [nvarchar](max) NULL,
	[forename] [nvarchar](max) NULL,
	[middlenames] [nvarchar](max) NULL,
	[gender] [nvarchar](max) NULL,
	[dob] [nvarchar](max) NULL
)
GO
/****** Object:  UserDefinedFunction [dbo].[ufnCalcCheckStatusID]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   FUNCTION [dbo].[ufnCalcCheckStatusID] (@checkId int)
    RETURNS int
AS
BEGIN
    DECLARE
        @checkTimeLimit tinyint,
        @complete bit,
        @isLiveCheck bit,
        @pinExpiresAt datetimeoffset,
        @processingFailed bit,
        @pupilLoginDate datetimeoffset,
        @receivedByServerAt datetimeoffset,
        @ret int
    ;

    SELECT
        TOP 1
            @checkTimeLimit = checkTimeLimit
      FROM
          [mtc_admin].[settings];

    SELECT
            @complete = complete,
            @isLiveCheck = isLiveCheck,
            @ret = checkStatus_id, -- set the return val to the current status
            @pinExpiresAt = pinExpiresAt,
            @processingFailed = processingFailed,
            @pupilLoginDate = pupilLoginDate,
            @receivedByServerAt = receivedByServerAt
      FROM
          [mtc_admin].[check] c LEFT OUTER JOIN
          [mtc_admin].[checkPin] cp ON (c.id = cp.check_id)
     WHERE
             c.id = @checkId;

    -- NEW
    IF (@pupilLoginDate IS NULL AND
        @receivedByServerAt IS NULL AND
        @pinExpiresAt IS NOT NULL AND
        @pinExpiresAt > GETUTCDATE())
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'NEW';
            RETURN @ret;
        END

    -- LIVE COLLECTED
    IF (@isLiveCheck = 1 AND
        @pupilLoginDate IS NOT NULL AND
        @receivedByServerAt IS NULL AND
        @pinExpiresAt IS NOT NULL AND
        @pinExpiresAt > GETUTCDATE() AND
        GETUTCDATE() < DATEADD(minute, @checkTimeLimit, @pupilLoginDate))
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'COL';
            RETURN @ret;
        END

    -- TRY IT OUT COLLECTED
    IF (@isLiveCheck = 0 AND
        @pupilLoginDate IS NOT NULL)
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'COL';
            RETURN @ret;
        END

    -- COMPLETE
    IF (@isLiveCheck = 1 AND
        @pupilLoginDate IS NOT NULL AND
        @receivedByServerAt IS NOT NULL AND
        @complete = 1 AND
        @processingFailed = 0)
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'CMP';
            RETURN @ret;
        END

    -- NOT RECEIVED
    IF (@isLiveCheck = 1 AND
        @pupilLoginDate IS NOT NULL AND
        DATEADD(minute, @checkTimeLimit, @pupilLoginDate) < GETUTCDATE())
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'NTR';
            RETURN @ret;
        END

    -- PROCESSING FAILED / ERROR
    IF (@isLiveCheck = 1 AND
        @pupilLoginDate IS NOT NULL AND
        @receivedByServerAt IS NOT NULL AND
        @processingFailed = 1)
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'ERR';
            RETURN @ret;
        END

    -- If none of the IF conditions were met this will return the original
    -- check status id.
    RETURN @ret;
END;
GO
/****** Object:  UserDefinedFunction [mtc_admin].[ufnCalcCheckStatusID]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   FUNCTION [mtc_admin].[ufnCalcCheckStatusID] (@checkId int)
    RETURNS int
AS
BEGIN
    DECLARE
        @checkTimeLimit tinyint,
        @complete bit,
        @isLiveCheck bit,
        @pinExpiresAt datetimeoffset,
        @processingFailed bit,
        @pupilLoginDate datetimeoffset,
        @receivedByServerAt datetimeoffset,
        @ret int
    ;

    SELECT
        TOP 1
            @checkTimeLimit = checkTimeLimit
      FROM
          [mtc_admin].[settings];

    SELECT
            @complete = complete,
            @isLiveCheck = isLiveCheck,
            @ret = checkStatus_id, -- set the return val to the current status
            @pinExpiresAt = pinExpiresAt,
            @processingFailed = processingFailed,
            @pupilLoginDate = pupilLoginDate,
            @receivedByServerAt = receivedByServerAt
      FROM
          [mtc_admin].[check] c LEFT OUTER JOIN
          [mtc_admin].[checkPin] cp ON (c.id = cp.check_id)
     WHERE
             c.id = @checkId;

    -- NEW
    IF (@pupilLoginDate IS NULL AND
        @receivedByServerAt IS NULL AND
        @pinExpiresAt IS NOT NULL AND
        @pinExpiresAt > GETUTCDATE())
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'NEW';
            RETURN @ret;
        END

    -- EXPIRED
    IF ((@pupilLoginDate IS NULL OR
         @pupilLoginDate IS NOT NULL AND @isLiveCheck = 0) AND
        @receivedByServerAt IS NULL AND
        @complete = 0)
        BEGIN
            IF (@pinExpiresAt IS NULL OR
                @pinExpiresAt <= GETUTCDATE())
                BEGIN
                    SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'EXP';
                    RETURN @ret;
                END
        END

    -- LIVE COLLECTED
    IF (@isLiveCheck = 1 AND
        @pupilLoginDate IS NOT NULL AND
        @receivedByServerAt IS NULL AND
        @pinExpiresAt IS NOT NULL AND
        @pinExpiresAt > GETUTCDATE() AND
        GETUTCDATE() < DATEADD(minute, @checkTimeLimit, @pupilLoginDate))
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'COL';
            RETURN @ret;
        END

    -- TRY IT OUT COLLECTED
    IF (@isLiveCheck = 0 AND
        @pupilLoginDate IS NOT NULL)
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'COL';
            RETURN @ret;
        END

    -- COMPLETE
    IF (@isLiveCheck = 1 AND
        @pupilLoginDate IS NOT NULL AND
        @receivedByServerAt IS NOT NULL AND
        @complete = 1 AND
        @processingFailed = 0)
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'CMP';
            RETURN @ret;
        END

    -- NOT RECEIVED
    IF (@isLiveCheck = 1 AND
        @pupilLoginDate IS NOT NULL AND
        DATEADD(minute, @checkTimeLimit, @pupilLoginDate) < GETUTCDATE())
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'NTR';
            RETURN @ret;
        END

    -- PROCESSING FAILED / ERROR
    IF (@isLiveCheck = 1 AND
        @pupilLoginDate IS NOT NULL AND
        @receivedByServerAt IS NOT NULL AND
        @processingFailed = 1)
        BEGIN
            SELECT @ret = id FROM [mtc_admin].[checkStatus] where code = 'ERR';
            RETURN @ret;
        END

    -- If none of the IF conditions were met this will return the original
    -- check status id.
    RETURN @ret;
END;

GO
/****** Object:  Table [mtc_admin].[checkStatus]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[checkStatus](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[description] [nvarchar](50) NOT NULL,
	[code] [char](3) NOT NULL,
 CONSTRAINT [PK_checkStatus] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [checkStatus_code_uindex] UNIQUE NONCLUSTERED
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[check]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[check](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[pupil_id] [int] NOT NULL,
	[checkCode] [uniqueidentifier] NOT NULL,
	[checkWindow_id] [int] NOT NULL,
	[checkForm_id] [int] NOT NULL,
	[pupilLoginDate] [datetimeoffset](3) NULL,
	[receivedByServerAt] [datetimeoffset](7) NULL,
	[checkStatus_id] [int] NOT NULL,
	[isLiveCheck] [bit] NOT NULL,
	[received] [bit] NOT NULL,
	[complete] [bit] NOT NULL,
	[completedAt] [datetimeoffset](3) NULL,
	[processingFailed] [bit] NOT NULL,
	[createdBy_userId] [int] NULL,
	[inputAssistantAddedRetrospectively] [bit] NOT NULL,
 CONSTRAINT [PK_check] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[pupil]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[pupil](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[school_id] [int] NOT NULL,
	[foreName] [nvarchar](128) MASKED WITH (FUNCTION = 'default()') NULL,
	[middleNames] [nvarchar](128) MASKED WITH (FUNCTION = 'default()') NULL,
	[lastName] [nvarchar](128) MASKED WITH (FUNCTION = 'default()') NULL,
	[gender] [char](1) NOT NULL,
	[dateOfBirth] [datetimeoffset](3) MASKED WITH (FUNCTION = 'default()') NOT NULL,
	[upn] [char](13) MASKED WITH (FUNCTION = 'default()') NOT NULL,
	[isTestAccount] [bit] NOT NULL,
	[urlSlug] [uniqueidentifier] NOT NULL,
	[job_id] [int] NULL,
	[jwtToken] [nvarchar](max) NULL,
	[jwtSecret] [nvarchar](max) NULL,
	[pupilAgeReason_id] [int] NULL,
	[group_id] [int] NULL,
	[currentCheckId] [int] NULL,
	[checkComplete] [bit] NULL,
	[restartAvailable] [bit] NULL,
	[attendanceId] [int] NULL,
	[foreNameAlias] [nvarchar](128) MASKED WITH (FUNCTION = 'default()') NULL,
	[lastNameAlias] [nvarchar](128) MASKED WITH (FUNCTION = 'default()') NULL,
 CONSTRAINT [PK_pupil] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [mtc_admin].[pin]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[pin](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[val] [int] NULL,
 CONSTRAINT [PK_pin] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [IX_pin_val_unique] UNIQUE NONCLUSTERED
(
	[val] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[checkPin]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[checkPin](
	[school_id] [int] NOT NULL,
	[pin_id] [int] NOT NULL,
	[check_id] [int] NOT NULL,
	[pinExpiresAt] [datetimeoffset](3) NOT NULL,
 CONSTRAINT [PK_checkPin] PRIMARY KEY CLUSTERED
(
	[school_id] ASC,
	[pin_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [IX_checkPin_check_id_unique] UNIQUE NONCLUSTERED
(
	[check_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  View [mtc_admin].[vewPupilsWithActiveLivePins]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   VIEW [mtc_admin].[vewPupilsWithActiveLivePins] AS
SELECT
    p.id,
    p.foreName,
    p.lastName,
    p.middleNames,
    p.dateOfBirth,
    p.urlSlug,
    p.upn,
    p.school_id,
    pin.val as pin,
    cp.pinExpiresAt,
    p.group_id
  FROM [mtc_admin].[pupil] p
       INNER JOIN [mtc_admin].[check] chk ON (p.currentCheckId = chk.id)
       INNER JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
       INNER JOIN [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
       INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
 WHERE  cp.pinExpiresAt > GETUTCDATE()
   AND  chkStatus.code = 'NEW'
   AND  chk.isLiveCheck = 1
   AND  p.attendanceId IS NULL
   AND  p.currentCheckId IS NOT NULL
;

GO
/****** Object:  Table [mtc_admin].[school]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[school](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[leaCode] [int] NOT NULL,
	[estabCode] [int] NOT NULL,
	[name] [nvarchar](max) NOT NULL,
	[pin] [char](8) NULL,
	[pinExpiresAt] [datetimeoffset](3) NULL,
	[urlSlug] [uniqueidentifier] NOT NULL,
	[urn] [int] NOT NULL,
	[dfeNumber] [int] NOT NULL,
 CONSTRAINT [PK_school] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  View [mtc_admin].[vewPupilsWithActiveFamiliarisationPins]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [mtc_admin].[vewPupilsWithActiveFamiliarisationPins] AS
SELECT
    p.id,
    p.foreName,
    p.lastName,
    p.middleNames,
    p.dateOfBirth,
    p.urlSlug,
    p.upn,
    p.school_id,
    pin.val as pin,
    cp.pinExpiresAt,
    p.group_id
FROM [mtc_admin].[pupil] p
     INNER JOIN [mtc_admin].[school] s ON (p.school_id = s.id)
     INNER JOIN [mtc_admin].[check] chk ON (chk.pupil_id = p.id)
     INNER JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
     INNER JOIN [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
     INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
WHERE  cp.pinExpiresAt > GETUTCDATE()
  AND  chkStatus.code IN ('NEW', 'COL')
  -- make sure we only select familiarisation checks
  AND  chk.isLiveCheck = 0
  -- don't include pupils who are not taking the check
  AND  p.attendanceId IS NULL
;

GO
/****** Object:  View [mtc_admin].[vewCompletedCheckCount]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [mtc_admin].[vewCompletedCheckCount] AS
    SELECT c.pupil_id, COUNT(c.id) AS [CompletedCheckCount]
    FROM [mtc_admin].[check] c
    WHERE c.complete = 1
    GROUP BY c.pupil_id
;
GO
/****** Object:  View [mtc_admin].[vewIncompleteCheckCount]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [mtc_admin].[vewIncompleteCheckCount] AS
    SELECT c.pupil_id, COUNT(c.id) AS [IncompleteCheckCount]
    FROM [mtc_admin].[check] c
    WHERE c.pupilLoginDate IS NOT NULL
      AND c.complete = 0
    GROUP BY c.pupil_id
;
GO
/****** Object:  View [mtc_admin].[vewPupilsEligibleForTryItOutPin]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   VIEW [mtc_admin].[vewPupilsEligibleForTryItOutPin]
AS
  SELECT
    p.id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.foreNameAlias,
    p.lastNameAlias,
    p.dateOfBirth,
    p.school_id,
    p.group_id,
    p.urlSlug,
    p.upn
  FROM
    [mtc_admin].[pupil] p
    LEFT JOIN [mtc_admin].[check] c ON (p.currentCheckId = c.id)
    LEFT JOIN [mtc_admin].[checkStatus] cs ON (c.checkStatus_id = cs.id)
  WHERE
    -- don't allow a try it out check for anyone who has left
    p.attendanceId IS NULL
    -- and exclude anyone who has a check that is not new
  AND
    (p.currentCheckId IS NULL OR (p.currentCheckId IS NOT NULL AND c.pupilLoginDate IS NULL))
    -- exclude pupils who already have an active familiarisation check
  AND
    p.id NOT IN
    (
      SELECT p2.id
      FROM [mtc_admin].[pupil] p2
        LEFT JOIN [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id)
        LEFT JOIN [mtc_admin].[checkStatus] AS chkStatus ON (chk.checkStatus_id = chkStatus.id)
        LEFT JOIN [mtc_admin].[checkPin] cp ON (c.id = cp.check_id)
      WHERE chk.isLiveCheck = 0
        AND chkStatus.code IN ('NEW', 'COL')
        AND p2.school_id = p.school_id
        AND cp.pinExpiresAt IS NOT NULL
        AND cp.pinExpiresAt > GETUTCDATE()
    )

GO
/****** Object:  View [mtc_admin].[vewPupilsEligibleForRestart]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [mtc_admin].[vewPupilsEligibleForRestart] AS

SELECT
    p.id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    p.urlSlug,
    p.school_id,
    p.group_id,
    count(*) as totalCheckCount
FROM
    [mtc_admin].[pupil] p INNER JOIN
    [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id) INNER JOIN
    [mtc_admin].[check] as currentCheck ON (p.currentCheckId = currentCheck.id)
WHERE
  -- don’t select pupils who are not attending
    p.attendanceId IS NULL
  -- remove unconsumed restarts
  AND   p.restartAvailable = 0
  -- pupils must have already logged in on the current check
  AND   currentCheck.pupilLoginDate IS NOT NULL
  -- for the count they must be live checks
  AND   chk.isLiveCheck = 1
  -- exclude expired checks, ensure the pupil logged in to the check
  AND   chk.pupilLoginDate IS NOT NULL
GROUP BY
    p.id,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    p.urlSlug,
    p.school_id,
    p.group_id
;


GO
/****** Object:  Table [mtc_admin].[checkWindow]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[checkWindow](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[name] [nvarchar](max) NOT NULL,
	[adminStartDate] [datetimeoffset](3) NOT NULL,
	[checkStartDate] [datetimeoffset](3) NOT NULL,
	[checkEndDate] [datetimeoffset](3) NOT NULL,
	[isDeleted] [bit] NOT NULL,
	[urlSlug] [uniqueidentifier] NOT NULL,
	[adminEndDate] [datetimeoffset](7) NOT NULL,
	[familiarisationCheckStartDate] [datetimeoffset](7) NOT NULL,
	[familiarisationCheckEndDate] [datetimeoffset](7) NOT NULL,
 CONSTRAINT [PK_checkWindow] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [mtc_admin].[vewCheckWindowWithStatus]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [mtc_admin].[vewCheckWindowWithStatus]
AS SELECT cw.urlSlug, cw.name, cw.isDeleted, CAST(
    CASE
        WHEN GETUTCDATE() < cw.adminStartDate THEN 'Inactive'
        WHEN GETUTCDATE() >= cw.adminStartDate AND GETUTCDATE() <= cw.adminEndDate THEN 'Active'
        ELSE 'Past'
    END AS NVARCHAR(50)
   ) AS [status]
FROM [mtc_admin].checkWindow cw

GO
/****** Object:  Table [mtc_admin].[attendanceCode]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[attendanceCode](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[reason] [nvarchar](50) NOT NULL,
	[order] [tinyint] NOT NULL,
	[code] [char](5) NOT NULL,
 CONSTRAINT [PK_attendanceCode] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [mtc_admin].[vewPupilStatus]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   VIEW [mtc_admin].[vewPupilStatus] AS (
    SELECT
        p.id,
        p.foreName,
        p.lastName,
        p.middleNames,
        p.dateOfBirth,
        p.group_id,
        p.urlSlug,
        p.school_id,
        cs.code as checkStatusCode,
        ac.reason,
        ac.code as reasonCode,

        -- the following fields are required to produce the pupil status
        p.attendanceId,
        p.checkComplete as pupilCheckComplete,
        p.currentCheckId,
        p.id as pupilId,
        p.restartAvailable,
        chk.received as checkReceived,
        chk.complete as checkComplete,
        chk.processingFailed,
        chk.pupilLoginDate,
        cp.pinExpiresAt
    FROM
        [mtc_admin].[pupil] p LEFT JOIN
        [mtc_admin].[check] chk ON (p.currentCheckId = chk.id) LEFT JOIN
        [mtc_admin].[checkStatus] cs ON (chk.checkStatus_id = cs.id) LEFT JOIN
        [mtc_admin].[attendanceCode] ac ON (p.attendanceId = ac.id) LEFT JOIN
        [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
);

GO
/****** Object:  View [mtc_admin].[vewPupilsWithActivePins]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [mtc_admin].[vewPupilsWithActivePins] AS
SELECT
    p.id,
    p.foreName,
    p.lastName,
    p.middleNames,
    p.dateOfBirth,
    p.urlSlug,
    p.school_id,
    pin.val as pin,
    cp.pinExpiresAt,
    p.group_id,
    chk.checkCode
FROM [mtc_admin].[pupil] p
     INNER JOIN [mtc_admin].[check] chk ON (chk.pupil_id = p.id)
     INNER JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
     INNER JOIN [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
     INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
WHERE
     cp.pinExpiresAt > GETUTCDATE()
AND  chkStatus.code = 'NEW'
AND  chk.pupilLoginDate IS NULL
;


GO
/****** Object:  View [mtc_admin].[vewPupilsEligibleForLivePinGeneration]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [mtc_admin].[vewPupilsEligibleForLivePinGeneration] AS
    SELECT p.id,
           p.foreName,
           p.middleNames,
           p.lastName,
           p.foreNameAlias,
           p.lastNameAlias,
           p.dateOfBirth,
           p.urlSlug,
           p.upn,
           p.school_id,
           p.group_id,
           -- diagnostic fields
           cp.pinExpiresAt,
           p.currentCheckId
    FROM [mtc_admin].[pupil] p LEFT JOIN
         [mtc_admin].[check] c ON (p.currentCheckId = c.id) LEFT JOIN
         -- We could avoid this join by moving pinExpiresAt to the check (along with the proposed field `pinValidFrom`)
         [mtc_admin].[checkPin] cp ON (c.id = cp.check_id)
    WHERE p.attendanceId IS NULL
      AND (
            -- no check has ever been allocated
            p.currentCheckId IS NULL
            OR
            p.restartAvailable = 1
            OR
            (
                -- the check was assigned but then expired
                p.currentCheckId IS NOT NULL
                AND (cp.pinExpiresAt IS NULL OR SYSDATETIMEOFFSET() > cp.pinExpiresAt)
                AND c.pupilLoginDate IS NULL -- the check must be pristine
            )
        )
;

GO
/****** Object:  View [mtc_admin].[vewPupilLiveChecksTakenCount]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   VIEW [mtc_admin].[vewPupilLiveChecksTakenCount] AS

    SELECT
        p.id as pupil_id,
        p.foreName,
        p.middleNames,
        p.lastName,
        p.dateOfBirth,
        p.urlSlug,
        p.school_id,
        count(*) as totalCheckCount
      FROM
          [mtc_admin].[pupil] p JOIN
          [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id)
     WHERE
       -- don’t select pupils who are not attending
                 p.attendanceId IS NULL
       -- pupils must have already attempted 1 or more checks that are not expired
       AND       chk.pupilLoginDate IS NOT NULL
       AND       chk.isLiveCheck = 1
     GROUP BY
         p.id,
         p.foreName,
         p.middleNames,
         p.lastName,
         p.dateOfBirth,
         p.urlSlug,
         p.school_id
;

GO
/****** Object:  Table [mtc_admin].[group]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[group](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](50) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[school_id] [int] NOT NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  View [mtc_admin].[vewPupilRegister]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [mtc_admin].[vewPupilRegister] AS
SELECT
    p.id as pupilId,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.urlSlug,
    p.dateOfBirth,
    p.upn,
    p.school_id,
    p.group_id,
    p.checkComplete as pupilCheckComplete,
    ISNULL(g.name, '-') as groupName,
    p.currentCheckId,
    p.attendanceId,
    c.complete as checkComplete,
    c.received as checkReceived,
    cs.code as checkStatusCode,
    p.restartAvailable,
    c.pupilLoginDate,
    cp.pinExpiresAt

FROM
    [mtc_admin].[pupil] p LEFT JOIN
    [mtc_admin].[group] g ON (p.group_id = g.id) LEFT JOIN
    [mtc_admin].[check] c ON (p.currentCheckId = c.id) LEFT JOIN
    [mtc_admin].[checkStatus] cs ON (c.checkStatus_id = cs.id) LEFT JOIN
    [mtc_admin].[checkPin] cp ON (c.id = cp.check_id)
;

GO
/****** Object:  View [mtc_admin].[vewCheckDiagnostic]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [mtc_admin].[vewCheckDiagnostic]
AS
SELECT
    c.id AS check_id,
    c.createdAt,
    c.checkCode,
    c.pupil_id,
    c.pupilLoginDate,
    c.receivedByServerAt,
    c.isLiveCheck,
    c.received as checkReceived,
    c.complete as checkComplete,
    c.completedAt as checkCompletedAt,
    c.processingFailed as checkProcessingFailed,
    p.foreName,
    p.lastName,
    p.currentCheckId,
    p.checkComplete as pupilCheckComplete,
    p.restartAvailable,
    p.attendanceId,
    s.id AS school_id,
    s.dfeNumber,
    s.name AS school_name,
    s.pin AS school_pin,
    cs.code AS check_status,
    cs.description AS check_desc,
    pin.val AS pupil_pin,
    cp.pinExpiresAt,
    IIF(cp.pinExpiresAt IS NULL OR cp.pinExpiresAt < GETUTCDATE(), 'Y', 'N') pinHasExpired
  FROM [mtc_admin].[check] c
       JOIN [mtc_admin].[checkStatus] cs ON (c.checkStatus_id = cs.id)
       JOIN [mtc_admin].[pupil] p ON (c.pupil_id = p.id)
       JOIN [mtc_admin].[school] s ON (p.school_id = s.id)
       LEFT JOIN [mtc_admin].[checkPin] cp ON (c.id = cp.check_id)
       LEFT JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
;
GO
/****** Object:  Table [mtc_admin].[checkForm]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[checkForm](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[name] [nvarchar](60) NOT NULL,
	[isDeleted] [bit] NOT NULL,
	[formData] [nvarchar](max) NOT NULL,
	[isLiveCheckForm] [bit] NOT NULL,
	[urlSlug] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_checkForm] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[checkFormWindow]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[checkFormWindow](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[checkForm_id] [int] NULL,
	[checkWindow_id] [int] NULL,
	[createdAt] [datetimeoffset](7) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  View [mtc_admin].[vewCheckWindowsWithStatusAndFormCountByType]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [mtc_admin].[vewCheckWindowsWithStatusAndFormCountByType] AS
  SELECT
    cw.urlSlug,
    cw.name,
    cw.createdAt,
    cw.isDeleted,
    cw.checkStartDate,
    cw.checkEndDate,
    cw.familiarisationCheckStartDate,
    cw.familiarisationCheckEndDate,
    CAST(
      CASE
          WHEN GETUTCDATE() < cw.adminStartDate THEN 'Inactive'
          WHEN GETUTCDATE() >= cw.adminStartDate AND GETUTCDATE() <= cw.adminEndDate THEN 'Active'
          ELSE 'Past'
      END AS NVARCHAR(50)
     ) AS [status],
    SUM(
      CASE
      WHEN cf.isLiveCheckForm = 0 THEN 1 ELSE 0 END
    ) AS FamiliarisationCheckFormCount,
    SUM(
      CASE
      WHEN cf.isLiveCheckForm = 1 THEN 1 ELSE 0 END
    ) AS LiveCheckFormCount
  FROM [mtc_admin].checkWindow cw
  LEFT JOIN [mtc_admin].checkFormWindow cfw
    ON cw.id = cfw.checkWindow_id
  LEFT JOIN [mtc_admin].checkForm cf
    ON cf.id = cfw.checkForm_id
  GROUP BY
    cw.urlSlug,
    cw.name,
    cw.createdAt,
    cw.isDeleted,
    cw.checkStartDate,
    cw.checkEndDate,
    cw.adminStartDate,
    cw.adminEndDate,
    cw.familiarisationCheckStartDate,
    cw.familiarisationCheckEndDate

GO
/****** Object:  View [mtc_admin].[vewCheckWindowsWithFormCount]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [mtc_admin].[vewCheckWindowsWithFormCount] AS
SELECT cw.id, cw.name,
cw.adminStartDate, cw.checkStartDate, cw.checkEndDate,
cw.isDeleted, COUNT(mtc_admin.checkFormWindow.checkWindow_id) AS FormCount
FROM mtc_admin.checkWindow cw LEFT OUTER JOIN
 mtc_admin.checkFormWindow ON cw.id = mtc_admin.checkFormWindow.checkWindow_id
GROUP BY cw.id, cw.name, cw.adminStartDate,
cw.checkStartDate, cw.checkEndDate, cw.isDeleted

GO
/****** Object:  Table [mtc_admin].[accessArrangements]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[accessArrangements](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[displayOrder] [smallint] NOT NULL,
	[description] [nvarchar](80) NOT NULL,
	[code] [char](3) NOT NULL,
 CONSTRAINT [PK_accessArrangements] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [accessArrangements_code_uindex] UNIQUE NONCLUSTERED
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[adminLogonEvent]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[adminLogonEvent](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[user_id] [int] NULL,
	[sessionId] [nvarchar](max) NOT NULL,
	[remoteIp] [nvarchar](max) NOT NULL,
	[userAgent] [nvarchar](max) NOT NULL,
	[loginMethod] [nvarchar](max) NOT NULL,
	[isAuthenticated] [bit] NOT NULL,
	[body] [nvarchar](max) NULL,
	[errorMsg] [nvarchar](max) NULL,
	[authProviderSessionToken] [nvarchar](max) NULL,
 CONSTRAINT [PK_adminLogonEvent] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[anomalyReportCache]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[anomalyReportCache](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[check_id] [int] NOT NULL,
	[jsonData] [nvarchar](max) NOT NULL,
	[version] [timestamp] NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
 CONSTRAINT [PK_anomalyReportCache] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [mtc_admin].[answer]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[answer](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[check_id] [int] NOT NULL,
	[questionNumber] [smallint] NOT NULL,
	[answer] [nvarchar](60) NOT NULL,
	[isCorrect] [bit] NOT NULL,
	[question_id] [int] NOT NULL,
 CONSTRAINT [PK_answers] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[auditLog]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[auditLog](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[rowData] [nvarchar](max) NOT NULL,
	[tableName] [nvarchar](255) NOT NULL,
	[operation] [nvarchar](20) NOT NULL,
	[createdAt] [datetimeoffset](7) NOT NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[azureBlobFile]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[azureBlobFile](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[container] [varchar](1000) NOT NULL,
	[fileName] [varchar](1000) NOT NULL,
	[eTag] [varchar](100) NOT NULL,
	[md5] [binary](16) NOT NULL,
	[azureBlobFileType_id] [int] NOT NULL,
	[urlSlug] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_azureBlobFile] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [IX_urlSlug_uindex] UNIQUE NONCLUSTERED
(
	[urlSlug] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[azureBlobFileType]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[azureBlobFileType](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[code] [varchar](10) NOT NULL,
	[description] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK_azureBlobFileType] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [IX_azureBlobFileType_uindex] UNIQUE NONCLUSTERED
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[checkConfig]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[checkConfig](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[check_id] [int] NOT NULL,
	[payload] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_checkConfig] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[checkScore]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[checkScore](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[checkId] [int] NOT NULL,
	[mark] [tinyint] NOT NULL,
	[markedAt] [datetimeoffset](3) NOT NULL,
 CONSTRAINT [PK_checkScores] PRIMARY KEY NONCLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[hdf]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[hdf](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[signedDate] [datetimeoffset](3) NOT NULL,
	[jobTitle] [nvarchar](max) NOT NULL,
	[fullName] [nvarchar](max) MASKED WITH (FUNCTION = 'default()') NOT NULL,
	[school_id] [int] NOT NULL,
	[user_id] [int] NOT NULL,
	[checkWindow_id] [int] NOT NULL,
	[confirmed] [bit] NOT NULL,
	[headTeacher] [bit] NOT NULL,
 CONSTRAINT [PK_hdf] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[integrationTest]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[integrationTest](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[tDecimal] [decimal](5, 2) NULL,
	[tNumeric] [numeric](5, 3) NULL,
	[tFloat] [real] NULL,
	[tNvarchar] [nvarchar](10) NULL,
	[tNvarCharMax] [nvarchar](max) NULL,
	[tDateTimeOffset] [datetimeoffset](3) NULL,
	[tDateTime] [datetime2](3) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[job]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[job](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[urlSlug] [uniqueidentifier] NOT NULL,
	[jobInput] [nvarchar](max) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[jobStatus_id] [int] NOT NULL,
	[jobType_id] [int] NOT NULL,
	[jobOutput] [nvarchar](max) NULL,
	[errorOutput] [nvarchar](max) NULL,
 CONSTRAINT [PK_job_id] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [mtc_admin].[jobStatus]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[jobStatus](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[description] [nvarchar](50) NOT NULL,
	[jobStatusCode] [char](3) NOT NULL,
 CONSTRAINT [PK_jobStatus] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [jobStatus_code_uindex] UNIQUE NONCLUSTERED
(
	[jobStatusCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [mtc_admin].[jobType]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[jobType](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[description] [nvarchar](50) NOT NULL,
	[jobTypeCode] [char](3) NOT NULL,
 CONSTRAINT [PK_jobType] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [jobType_code_uindex] UNIQUE NONCLUSTERED
(
	[jobTypeCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[psychometricianReportCache]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[psychometricianReportCache](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[check_id] [int] NOT NULL,
	[jsonData] [nvarchar](max) MASKED WITH (FUNCTION = 'default()') NOT NULL,
	[version] [timestamp] NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
 CONSTRAINT [PK_psychometricianReportCache] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [mtc_admin].[pupilAccessArrangements]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[pupilAccessArrangements](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[pupil_id] [int] NOT NULL,
	[questionReaderReasons_id] [int] NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[recordedBy_user_id] [int] NOT NULL,
	[inputAssistanceInformation] [nvarchar](1000) NULL,
	[questionReaderOtherInformation] [nvarchar](1000) NULL,
	[accessArrangements_id] [int] NOT NULL,
	[pupilFontSizes_id] [int] NULL,
	[pupilColourContrasts_Id] [int] NULL,
	[nextButtonInformation] [nvarchar](1000) NULL,
	[retroInputAssistantFirstName] [nvarchar](50) NULL,
	[retroInputAssistantLastName] [nvarchar](50) NULL,
	[retroInputAssistant_check_id] [int] NULL,
 CONSTRAINT [PK_pupilAccessArrangements] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [mtc_admin].[pupilAgeReason]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[pupilAgeReason](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[pupil_id] [int] NOT NULL,
	[reason] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_pupilAgeReason] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [pupilAgeReason_pupil_id_uindex] UNIQUE NONCLUSTERED
(
	[pupil_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [mtc_admin].[pupilAttendance]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[pupilAttendance](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[recordedBy_user_id] [int] NOT NULL,
	[attendanceCode_id] [int] NOT NULL,
	[pupil_id] [int] NOT NULL,
	[isDeleted] [bit] NOT NULL,
 CONSTRAINT [PK_pupilAttendance] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [mtc_admin].[pupilColourContrasts]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[pupilColourContrasts](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[displayOrder] [smallint] NOT NULL,
	[description] [nvarchar](50) NOT NULL,
	[code] [char](3) NOT NULL,
 CONSTRAINT [PK_colourContrasts] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [colourContrasts_code_uindex] UNIQUE NONCLUSTERED
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[pupilFontSizes]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[pupilFontSizes](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[displayOrder] [smallint] NOT NULL,
	[description] [nvarchar](50) NOT NULL,
	[code] [char](3) NOT NULL,
 CONSTRAINT [PK_fontSizes] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [fontSizes_code_uindex] UNIQUE NONCLUSTERED
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[pupilRestart]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[pupilRestart](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[pupil_id] [int] NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[recordedByUser_id] [int] NOT NULL,
	[didNotCompleteInformation] [nvarchar](100) NULL,
	[furtherInformation] [nvarchar](1000) NULL,
	[isDeleted] [bit] NOT NULL,
	[deletedByUser_id] [int] NULL,
	[pupilRestartReason_id] [int] NOT NULL,
	[classDisruptionInformation] [nvarchar](100) NULL,
	[check_id] [int] NULL,
	[originCheck_id] [int] NULL,
 CONSTRAINT [PK_pupilRestart] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[pupilRestartCode]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[pupilRestartCode](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[description] [nvarchar](50) NOT NULL,
	[code] [char](3) NOT NULL,
 CONSTRAINT [PK_pupilRestartCode] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [pupilRestartCode_code_uindex] UNIQUE NONCLUSTERED
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[pupilRestartReason]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[pupilRestartReason](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[displayOrder] [smallint] NOT NULL,
	[description] [nvarchar](50) NOT NULL,
	[code] [char](3) NOT NULL,
 CONSTRAINT [PK_pupilRestartReason] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [pupilRestartReason_code_uindex] UNIQUE NONCLUSTERED
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[pupilResultsDiagnosticCache]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[pupilResultsDiagnosticCache](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[school_id] [int] NOT NULL,
	[payload] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_pupilResultsDiagnosticCache_id] PRIMARY KEY NONCLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [mtc_admin].[question]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[question](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[factor1] [tinyint] NOT NULL,
	[factor2] [tinyint] NOT NULL,
	[code] [varchar](10) NOT NULL,
	[isWarmup] [bit] NOT NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[questionReaderReasons]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[questionReaderReasons](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[displayOrder] [smallint] NOT NULL,
	[description] [nvarchar](50) NOT NULL,
	[code] [char](3) NOT NULL,
 CONSTRAINT [PK_questionReaderReasons] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [questionReaderReasons_code_uindex] UNIQUE NONCLUSTERED
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[role]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[role](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[title] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_role] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[sce]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[sce](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[school_id] [int] NOT NULL,
	[timezone] [nvarchar](200) NOT NULL,
	[isOpen] [bit] NOT NULL,
	[countryCode] [char](2) NOT NULL,
 CONSTRAINT [PK_sce] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[serviceMessage]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[serviceMessage](
	[id] [int] NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[createdByUser_id] [int] NOT NULL,
	[title] [nvarchar](max) NOT NULL,
	[message] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_serviceMessage] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [mtc_admin].[settings]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[settings](
	[id] [tinyint] NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[loadingTimeLimit] [decimal](5, 2) NOT NULL,
	[questionTimeLimit] [decimal](5, 2) NOT NULL,
	[checkTimeLimit] [tinyint] NOT NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[settingsLog]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[settingsLog](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[loadingTimeLimit] [decimal](5, 2) NOT NULL,
	[questionTimeLimit] [decimal](5, 2) NOT NULL,
	[user_id] [int] NULL,
	[checkTimeLimit] [tinyint] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_admin].[user]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_admin].[user](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[identifier] [nvarchar](64) MASKED WITH (FUNCTION = 'default()') NOT NULL,
	[passwordHash] [nvarchar](max) NULL,
	[school_id] [int] NULL,
	[role_id] [int] NOT NULL,
	[displayName] [nvarchar](255) MASKED WITH (FUNCTION = 'default()') NULL,
 CONSTRAINT [PK_user] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [user_identifier_uindex] UNIQUE NONCLUSTERED
(
	[identifier] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [mtc_results].[answer]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_results].[answer](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[checkResult_id] [int] NOT NULL,
	[questionNumber] [smallint] NOT NULL,
	[answer] [nvarchar](60) NOT NULL,
	[question_id] [int] NOT NULL,
	[isCorrect] [bit] NOT NULL,
	[browserTimestamp] [datetimeoffset](3) NOT NULL,
 CONSTRAINT [PK_answer] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [answer_checkResult_id_questionNumber_uindex] UNIQUE NONCLUSTERED
(
	[checkResult_id] ASC,
	[questionNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_results].[browserFamilyLookup]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_results].[browserFamilyLookup](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[family] [nvarchar](255) NOT NULL,
 CONSTRAINT [PK_browserFamilyLookup] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [browserFamilyLookup_family_uindex] UNIQUE NONCLUSTERED
(
	[family] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_results].[checkResult]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_results].[checkResult](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[check_id] [int] NOT NULL,
	[mark] [tinyint] NOT NULL,
	[markedAt] [datetimeoffset](3) NOT NULL,
	[userDevice_id] [int] NULL,
 CONSTRAINT [PK_checkResult] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [result_check_id_uindex] UNIQUE NONCLUSTERED
(
	[check_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_results].[deviceOrientationLookup]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_results].[deviceOrientationLookup](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[orientation] [nvarchar](32) NOT NULL,
 CONSTRAINT [PK_deviceOrientationLookup] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [deviceOrientationLookup_orientation_uindex] UNIQUE NONCLUSTERED
(
	[orientation] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_results].[event]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_results].[event](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[checkResult_id] [int] NOT NULL,
	[eventTypeLookup_id] [int] NOT NULL,
	[browserTimestamp] [datetimeoffset](3) NOT NULL,
	[eventData] [nvarchar](max) NULL,
	[question_id] [int] NULL,
	[questionNumber] [smallint] NULL,
 CONSTRAINT [PK_event] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [mtc_results].[eventTypeLookup]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_results].[eventTypeLookup](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[eventType] [nvarchar](255) NOT NULL,
	[eventDescription] [nvarchar](4000) NULL,
 CONSTRAINT [PK_eventTypeLookup] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [eventTypeLookup_eventType_uindex] UNIQUE NONCLUSTERED
(
	[eventType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_results].[navigatorLanguageLookup]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_results].[navigatorLanguageLookup](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[platformLang] [nvarchar](36) NOT NULL,
 CONSTRAINT [PK_navigatorLanguageLookup] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [navigatorLanguageLookup_platformLang_uindex] UNIQUE NONCLUSTERED
(
	[platformLang] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_results].[navigatorPlatformLookup]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_results].[navigatorPlatformLookup](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[platform] [nvarchar](255) NOT NULL,
 CONSTRAINT [PK_navigatorPlatformLookup] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [navigatorPlatformLookup_platform_uindex] UNIQUE NONCLUSTERED
(
	[platform] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_results].[networkConnectionEffectiveTypeLookup]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_results].[networkConnectionEffectiveTypeLookup](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[effectiveType] [nvarchar](10) NOT NULL,
 CONSTRAINT [PK_networkConnectionEffectiveTypeLookup] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [networkConnectionEffectiveTypeLookup_effectiveType_uindex] UNIQUE NONCLUSTERED
(
	[effectiveType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_results].[uaOperatingSystemLookup]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_results].[uaOperatingSystemLookup](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[os] [nvarchar](255) NOT NULL,
 CONSTRAINT [PK_uaOperatingSystemLookup] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [uaOperatingSystemLookup_os_uindex] UNIQUE NONCLUSTERED
(
	[os] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_results].[userAgentLookup]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_results].[userAgentLookup](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[userAgent] [nvarchar](4000) NOT NULL,
	[userAgentHash] [binary](32) NOT NULL,
 CONSTRAINT [PK_userAgent] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [userAgent_userAgentHash_uindex] UNIQUE NONCLUSTERED
(
	[userAgentHash] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_results].[userDevice]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_results].[userDevice](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[batteryIsCharging] [bit] NULL,
	[batteryLevelPercent] [tinyint] NULL,
	[batteryChargingTimeSecs] [int] NULL,
	[batteryDischargingTimeSecs] [int] NULL,
	[cpuHardwareConcurrency] [tinyint] NULL,
	[browserFamilyLookup_id] [int] NULL,
	[browserMajorVersion] [int] NULL,
	[browserMinorVersion] [int] NULL,
	[browserPatchVersion] [int] NULL,
	[uaOperatingSystemLookup_id] [int] NULL,
	[uaOperatingSystemMajorVersion] [int] NULL,
	[uaOperatingSystemMinorVersion] [int] NULL,
	[uaOperatingSystemPatchVersion] [int] NULL,
	[navigatorPlatformLookup_id] [int] NULL,
	[navigatorLanguageLookup_id] [int] NULL,
	[navigatorCookieEnabled] [bit] NULL,
	[networkConnectionDownlink] [float] NULL,
	[networkConnectionEffectiveTypeLookup_id] [int] NULL,
	[networkConnectionRtt] [tinyint] NULL,
	[screenWidth] [int] NULL,
	[screenHeight] [int] NULL,
	[outerWidth] [int] NULL,
	[outerHeight] [int] NULL,
	[innerWidth] [int] NULL,
	[innerHeight] [int] NULL,
	[colourDepth] [tinyint] NULL,
	[deviceOrientationLookup_id] [int] NULL,
	[appUsageCount] [tinyint] NULL,
	[userAgentLookup_id] [int] NULL,
  [ident] NVARCHAR (100) NULL
 CONSTRAINT [PK_userDevice] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_results].[userInput]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_results].[userInput](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[answer_id] [int] NOT NULL,
	[userInput] [nvarchar](40) NOT NULL,
	[userInputTypeLookup_id] [int] NOT NULL,
	[browserTimestamp] [datetimeoffset](3) NOT NULL,
 CONSTRAINT [PK_userInput] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [mtc_results].[userInputTypeLookup]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [mtc_results].[userInputTypeLookup](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdAt] [datetimeoffset](3) NOT NULL,
	[updatedAt] [datetimeoffset](3) NOT NULL,
	[version] [timestamp] NOT NULL,
	[name] [nvarchar](10) NOT NULL,
	[code] [char](1) NOT NULL,
 CONSTRAINT [PK_userInputTypeLookup] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [userInputType_code_uindex] UNIQUE NONCLUSTERED
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Index [adminLogonEvent_user_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [adminLogonEvent_user_id_index] ON [mtc_admin].[adminLogonEvent]
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [answer_check_id_questionNumber_uindex]    Script Date: 29/10/2020 17:26:24 ******/
CREATE UNIQUE NONCLUSTERED INDEX [answer_check_id_questionNumber_uindex] ON [mtc_admin].[answer]
(
	[check_id] ASC,
	[questionNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [ix_answer_question_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [ix_answer_question_id] ON [mtc_admin].[answer]
(
	[question_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [attendanceCode_code_uindex]    Script Date: 29/10/2020 17:26:24 ******/
CREATE UNIQUE NONCLUSTERED INDEX [attendanceCode_code_uindex] ON [mtc_admin].[attendanceCode]
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [auditLog_tableName_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [auditLog_tableName_index] ON [mtc_admin].[auditLog]
(
	[tableName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [check_checkCode_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE UNIQUE NONCLUSTERED INDEX [check_checkCode_index] ON [mtc_admin].[check]
(
	[checkCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [check_checkForm_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [check_checkForm_id_index] ON [mtc_admin].[check]
(
	[checkForm_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [check_checkStatus_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [check_checkStatus_id_index] ON [mtc_admin].[check]
(
	[checkStatus_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [check_pupil_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [check_pupil_id_index] ON [mtc_admin].[check]
(
	[pupil_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [checkConfig_check_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [checkConfig_check_id_index] ON [mtc_admin].[checkConfig]
(
	[check_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [checkForm_name_uindex]    Script Date: 29/10/2020 17:26:24 ******/
CREATE UNIQUE NONCLUSTERED INDEX [checkForm_name_uindex] ON [mtc_admin].[checkForm]
(
	[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [checkFormWindow_checkForm_id_checkWindow_id_uindex]    Script Date: 29/10/2020 17:26:24 ******/
CREATE UNIQUE NONCLUSTERED INDEX [checkFormWindow_checkForm_id_checkWindow_id_uindex] ON [mtc_admin].[checkFormWindow]
(
	[checkForm_id] ASC,
	[checkWindow_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [checkPin_pin_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [checkPin_pin_id_index] ON [mtc_admin].[checkPin]
(
	[pin_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [ix_checkScore_check_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [ix_checkScore_check_id] ON [mtc_admin].[checkScore]
(
	[checkId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [checkWindow_urlSlug_uindex]    Script Date: 29/10/2020 17:26:24 ******/
CREATE UNIQUE NONCLUSTERED INDEX [checkWindow_urlSlug_uindex] ON [mtc_admin].[checkWindow]
(
	[urlSlug] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [group_school_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [group_school_id_index] ON [mtc_admin].[group]
(
	[school_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [ix_hdf_school_checkWindow_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE UNIQUE NONCLUSTERED INDEX [ix_hdf_school_checkWindow_id] ON [mtc_admin].[hdf]
(
	[school_id] ASC,
	[checkWindow_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [ix_hdf_user_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [ix_hdf_user_id] ON [mtc_admin].[hdf]
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [psychometricianReportCache_check_id_uindex]    Script Date: 29/10/2020 17:26:24 ******/
CREATE UNIQUE NONCLUSTERED INDEX [psychometricianReportCache_check_id_uindex] ON [mtc_admin].[psychometricianReportCache]
(
	[check_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupil_attendanceId_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupil_attendanceId_index] ON [mtc_admin].[pupil]
(
	[attendanceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupil_currentCheckId_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupil_currentCheckId_index] ON [mtc_admin].[pupil]
(
	[currentCheckId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupil_group_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupil_group_id_index] ON [mtc_admin].[pupil]
(
	[group_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupil_school_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupil_school_id_index] ON [mtc_admin].[pupil]
(
	[school_id] ASC
)
INCLUDE([currentCheckId],[attendanceId],[checkComplete],[group_id],[restartAvailable],[upn],[urlSlug],[foreName],[middleNames],[lastName],[dateOfBirth],[foreNameAlias],[lastNameAlias]) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [pupil_upn_school_id_uindex]    Script Date: 29/10/2020 17:26:24 ******/
CREATE UNIQUE NONCLUSTERED INDEX [pupil_upn_school_id_uindex] ON [mtc_admin].[pupil]
(
	[upn] ASC,
	[school_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupil_urlSlug_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE UNIQUE NONCLUSTERED INDEX [pupil_urlSlug_index] ON [mtc_admin].[pupil]
(
	[urlSlug] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupilAccessArrangements_accessArrangements_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupilAccessArrangements_accessArrangements_id_index] ON [mtc_admin].[pupilAccessArrangements]
(
	[accessArrangements_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupilAccessArrangements_pupil_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupilAccessArrangements_pupil_id_index] ON [mtc_admin].[pupilAccessArrangements]
(
	[pupil_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupilAccessArrangements_pupilColourContrasts_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupilAccessArrangements_pupilColourContrasts_id_index] ON [mtc_admin].[pupilAccessArrangements]
(
	[pupilColourContrasts_Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupilAccessArrangements_pupilFontSizes_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupilAccessArrangements_pupilFontSizes_id_index] ON [mtc_admin].[pupilAccessArrangements]
(
	[pupilFontSizes_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupilAccessArrangements_questionReaderReasons_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupilAccessArrangements_questionReaderReasons_id_index] ON [mtc_admin].[pupilAccessArrangements]
(
	[questionReaderReasons_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupilAttendance_attendanceCode_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupilAttendance_attendanceCode_id_index] ON [mtc_admin].[pupilAttendance]
(
	[attendanceCode_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupilAttendance_pupil_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupilAttendance_pupil_id_index] ON [mtc_admin].[pupilAttendance]
(
	[pupil_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupilAttendance_user_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupilAttendance_user_id_index] ON [mtc_admin].[pupilAttendance]
(
	[recordedBy_user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupilRestart_check_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupilRestart_check_id_index] ON [mtc_admin].[pupilRestart]
(
	[check_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupilRestart_originCheck_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupilRestart_originCheck_id_index] ON [mtc_admin].[pupilRestart]
(
	[originCheck_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupilRestart_pupil_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupilRestart_pupil_id_index] ON [mtc_admin].[pupilRestart]
(
	[pupil_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [pupilRestart_pupilRestartReason_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [pupilRestart_pupilRestartReason_id_index] ON [mtc_admin].[pupilRestart]
(
	[pupilRestartReason_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [sce_school_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [sce_school_id_index] ON [mtc_admin].[sce]
(
	[school_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [school_dfeNumber_uindex]    Script Date: 29/10/2020 17:26:24 ******/
CREATE UNIQUE NONCLUSTERED INDEX [school_dfeNumber_uindex] ON [mtc_admin].[school]
(
	[dfeNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [school_pin_uindex]    Script Date: 29/10/2020 17:26:24 ******/
CREATE UNIQUE NONCLUSTERED INDEX [school_pin_uindex] ON [mtc_admin].[school]
(
	[pin] ASC
)
WHERE ([pin] IS NOT NULL)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [school_urlSlug_uindex]    Script Date: 29/10/2020 17:26:24 ******/
CREATE UNIQUE NONCLUSTERED INDEX [school_urlSlug_uindex] ON [mtc_admin].[school]
(
	[urlSlug] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [school_urn_uindex]    Script Date: 29/10/2020 17:26:24 ******/
CREATE UNIQUE NONCLUSTERED INDEX [school_urn_uindex] ON [mtc_admin].[school]
(
	[urn] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [user_role_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [user_role_id_index] ON [mtc_admin].[user]
(
	[role_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [user_school_id_index]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [user_school_id_index] ON [mtc_admin].[user]
(
	[school_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [ix_answer_checkResult_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [ix_answer_checkResult_id] ON [mtc_results].[answer]
(
	[checkResult_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [ix_answer_question_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [ix_answer_question_id] ON [mtc_results].[answer]
(
	[question_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [checkResult_userDevice_uindex]    Script Date: 29/10/2020 17:26:24 ******/
CREATE UNIQUE NONCLUSTERED INDEX [checkResult_userDevice_uindex] ON [mtc_results].[checkResult]
(
	[userDevice_id] ASC
)
WHERE ([userDevice_id] IS NOT NULL)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [ix_checkResult_check_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [ix_checkResult_check_id] ON [mtc_results].[checkResult]
(
	[check_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [ix_checkResult_userDevice_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [ix_checkResult_userDevice_id] ON [mtc_results].[checkResult]
(
	[userDevice_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [ix_event_checkResult_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [ix_event_checkResult_id] ON [mtc_results].[event]
(
	[checkResult_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [ix_event_eventTypeLookup_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [ix_event_eventTypeLookup_id] ON [mtc_results].[event]
(
	[eventTypeLookup_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [ix_event_question_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [ix_event_question_id] ON [mtc_results].[event]
(
	[question_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [userDevice_browserFamilyLookup_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [userDevice_browserFamilyLookup_id] ON [mtc_results].[userDevice]
(
	[browserFamilyLookup_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [userDevice_deviceOrientationLookup_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [userDevice_deviceOrientationLookup_id] ON [mtc_results].[userDevice]
(
	[deviceOrientationLookup_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [userDevice_navigatorLanguageLookup_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [userDevice_navigatorLanguageLookup_id] ON [mtc_results].[userDevice]
(
	[navigatorLanguageLookup_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [userDevice_navigatorPlatformLookup_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [userDevice_navigatorPlatformLookup_id] ON [mtc_results].[userDevice]
(
	[navigatorPlatformLookup_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [userDevice_networkConnectionEffectiveType_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [userDevice_networkConnectionEffectiveType_id] ON [mtc_results].[userDevice]
(
	[networkConnectionEffectiveTypeLookup_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [userDevice_uaOperatingSystemLookup_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [userDevice_uaOperatingSystemLookup_id] ON [mtc_results].[userDevice]
(
	[uaOperatingSystemLookup_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [userDevice_useragentLookup_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [userDevice_useragentLookup_id] ON [mtc_results].[userDevice]
(
	[userAgentLookup_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [ix_event_userInput_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [ix_event_userInput_id] ON [mtc_results].[userInput]
(
	[answer_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [ix_event_userInputTypeLookup_id]    Script Date: 29/10/2020 17:26:24 ******/
CREATE NONCLUSTERED INDEX [ix_event_userInputTypeLookup_id] ON [mtc_results].[userInput]
(
	[userInputTypeLookup_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [mtc_admin].[accessArrangements] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[accessArrangements] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[adminLogonEvent] ADD  CONSTRAINT [DF_adminLogonEvent_createdAt_default]  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[adminLogonEvent] ADD  CONSTRAINT [DF_adminLogonEvent_updatedAt_default]  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[anomalyReportCache] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[anomalyReportCache] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[answer] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[answer] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[answer] ADD  DEFAULT ('') FOR [answer]
GO
ALTER TABLE [mtc_admin].[attendanceCode] ADD  CONSTRAINT [DF_attendanceCode_createdAt_default]  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[attendanceCode] ADD  CONSTRAINT [DF_attendanceCode_updatedAt_default]  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[auditLog] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[azureBlobFile] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[azureBlobFile] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[azureBlobFile] ADD  DEFAULT (newid()) FOR [urlSlug]
GO
ALTER TABLE [mtc_admin].[azureBlobFileType] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[azureBlobFileType] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[check] ADD  CONSTRAINT [DF_check_createdAt_default]  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[check] ADD  CONSTRAINT [DF_check_updatedAt_default]  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[check] ADD  CONSTRAINT [DF_check_checkCode_default]  DEFAULT (newid()) FOR [checkCode]
GO
ALTER TABLE [mtc_admin].[check] ADD  CONSTRAINT [DF_check_checkStatus_id_default]  DEFAULT ((1)) FOR [checkStatus_id]
GO
ALTER TABLE [mtc_admin].[check] ADD  CONSTRAINT [DF_received_Default]  DEFAULT ((0)) FOR [received]
GO
ALTER TABLE [mtc_admin].[check] ADD  CONSTRAINT [DF_complete_Default]  DEFAULT ((0)) FOR [complete]
GO
ALTER TABLE [mtc_admin].[check] ADD  CONSTRAINT [DF_processingFailed_Default]  DEFAULT ((0)) FOR [processingFailed]
GO
ALTER TABLE [mtc_admin].[check] ADD  CONSTRAINT [check_inputAssistantAddedRetrospectively_Default]  DEFAULT ((0)) FOR [inputAssistantAddedRetrospectively]
GO
ALTER TABLE [mtc_admin].[checkConfig] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[checkConfig] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[checkForm] ADD  CONSTRAINT [DF_checkForm_createdAt_default]  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[checkForm] ADD  CONSTRAINT [DF_checkForm_updatedAt_default]  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[checkForm] ADD  CONSTRAINT [DF_checkForm_isDeleted_default]  DEFAULT ((0)) FOR [isDeleted]
GO
ALTER TABLE [mtc_admin].[checkForm] ADD  CONSTRAINT [isLiveCheckFormDefault]  DEFAULT ((1)) FOR [isLiveCheckForm]
GO
ALTER TABLE [mtc_admin].[checkForm] ADD  CONSTRAINT [urlSlugDefault]  DEFAULT (newid()) FOR [urlSlug]
GO
ALTER TABLE [mtc_admin].[checkFormWindow] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[checkScore] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[checkScore] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[checkStatus] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[checkStatus] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[checkWindow] ADD  CONSTRAINT [DF_checkWindow_createdAt_default]  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[checkWindow] ADD  CONSTRAINT [DF_checkWindow_updatedAt_default]  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[checkWindow] ADD  DEFAULT ((0)) FOR [isDeleted]
GO
ALTER TABLE [mtc_admin].[checkWindow] ADD  DEFAULT (newid()) FOR [urlSlug]
GO
ALTER TABLE [mtc_admin].[group] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[group] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[hdf] ADD  CONSTRAINT [DF_hdf_createdAt_default]  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[hdf] ADD  CONSTRAINT [DF_hdf_updatedAt_default]  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[hdf] ADD  CONSTRAINT [DF_hdf_signedDate_default]  DEFAULT (getutcdate()) FOR [signedDate]
GO
ALTER TABLE [mtc_admin].[job] ADD  DEFAULT (newid()) FOR [urlSlug]
GO
ALTER TABLE [mtc_admin].[job] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[job] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[jobStatus] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[jobStatus] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[jobType] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[jobType] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[pin] ADD  CONSTRAINT [DF_pin_created_at]  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[pin] ADD  CONSTRAINT [DF_pin_updated_at]  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[psychometricianReportCache] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[psychometricianReportCache] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[pupil] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[pupil] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[pupil] ADD  DEFAULT ((0)) FOR [isTestAccount]
GO
ALTER TABLE [mtc_admin].[pupil] ADD  DEFAULT (newid()) FOR [urlSlug]
GO
ALTER TABLE [mtc_admin].[pupil] ADD  CONSTRAINT [DF_checkComplete_Default]  DEFAULT ((0)) FOR [checkComplete]
GO
ALTER TABLE [mtc_admin].[pupil] ADD  CONSTRAINT [DF_restartAvailable_Default]  DEFAULT ((0)) FOR [restartAvailable]
GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[pupilAttendance] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[pupilAttendance] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[pupilAttendance] ADD  DEFAULT ((0)) FOR [isDeleted]
GO
ALTER TABLE [mtc_admin].[pupilColourContrasts] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[pupilColourContrasts] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[pupilFontSizes] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[pupilFontSizes] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[pupilRestart] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[pupilRestart] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[pupilRestart] ADD  DEFAULT ((0)) FOR [isDeleted]
GO
ALTER TABLE [mtc_admin].[pupilRestartCode] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[pupilRestartCode] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[pupilRestartReason] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[pupilRestartReason] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[question] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[question] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[questionReaderReasons] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[questionReaderReasons] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[role] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[role] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[sce] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[sce] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[school] ADD  CONSTRAINT [DF_school_createdAt_default]  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[school] ADD  CONSTRAINT [DF_school_updatedAt_default]  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[school] ADD  DEFAULT (newid()) FOR [urlSlug]
GO
ALTER TABLE [mtc_admin].[serviceMessage] ADD  DEFAULT ((1)) FOR [id]
GO
ALTER TABLE [mtc_admin].[serviceMessage] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[serviceMessage] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[settings] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[settings] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[settingsLog] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[settingsLog] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[user] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_admin].[user] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_results].[answer] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_results].[answer] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_results].[answer] ADD  DEFAULT ('') FOR [answer]
GO
ALTER TABLE [mtc_results].[browserFamilyLookup] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_results].[browserFamilyLookup] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_results].[checkResult] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_results].[checkResult] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_results].[deviceOrientationLookup] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_results].[deviceOrientationLookup] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_results].[event] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_results].[event] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_results].[eventTypeLookup] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_results].[eventTypeLookup] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_results].[navigatorLanguageLookup] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_results].[navigatorLanguageLookup] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_results].[navigatorPlatformLookup] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_results].[navigatorPlatformLookup] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_results].[networkConnectionEffectiveTypeLookup] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_results].[networkConnectionEffectiveTypeLookup] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_results].[uaOperatingSystemLookup] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_results].[uaOperatingSystemLookup] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_results].[userAgentLookup] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_results].[userAgentLookup] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_results].[userDevice] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_results].[userDevice] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_results].[userInput] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_results].[userInput] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_results].[userInputTypeLookup] ADD  DEFAULT (getutcdate()) FOR [createdAt]
GO
ALTER TABLE [mtc_results].[userInputTypeLookup] ADD  DEFAULT (getutcdate()) FOR [updatedAt]
GO
ALTER TABLE [mtc_admin].[adminLogonEvent]  WITH CHECK ADD  CONSTRAINT [FK_adminLogonEvent_user_id] FOREIGN KEY([user_id])
REFERENCES [mtc_admin].[user] ([id])
GO
ALTER TABLE [mtc_admin].[adminLogonEvent] CHECK CONSTRAINT [FK_adminLogonEvent_user_id]
GO
ALTER TABLE [mtc_admin].[anomalyReportCache]  WITH CHECK ADD FOREIGN KEY([check_id])
REFERENCES [mtc_admin].[check] ([id])
GO
ALTER TABLE [mtc_admin].[answer]  WITH CHECK ADD  CONSTRAINT [FK_answer_question_id] FOREIGN KEY([question_id])
REFERENCES [mtc_admin].[question] ([id])
GO
ALTER TABLE [mtc_admin].[answer] CHECK CONSTRAINT [FK_answer_question_id]
GO
ALTER TABLE [mtc_admin].[answer]  WITH CHECK ADD  CONSTRAINT [FK_answers_check_id_check_id] FOREIGN KEY([check_id])
REFERENCES [mtc_admin].[check] ([id])
GO
ALTER TABLE [mtc_admin].[answer] CHECK CONSTRAINT [FK_answers_check_id_check_id]
GO
ALTER TABLE [mtc_admin].[azureBlobFile]  WITH CHECK ADD  CONSTRAINT [FK_azureBlobFile_azureBlobFileType_id_azureBlobFileType_id] FOREIGN KEY([azureBlobFileType_id])
REFERENCES [mtc_admin].[azureBlobFileType] ([id])
GO
ALTER TABLE [mtc_admin].[azureBlobFile] CHECK CONSTRAINT [FK_azureBlobFile_azureBlobFileType_id_azureBlobFileType_id]
GO
ALTER TABLE [mtc_admin].[check]  WITH CHECK ADD  CONSTRAINT [FK_check_checkForm_id] FOREIGN KEY([checkForm_id])
REFERENCES [mtc_admin].[checkForm] ([id])
GO
ALTER TABLE [mtc_admin].[check] CHECK CONSTRAINT [FK_check_checkForm_id]
GO
ALTER TABLE [mtc_admin].[check]  WITH CHECK ADD  CONSTRAINT [FK_check_checkStatus_id_checkStatus_id] FOREIGN KEY([checkStatus_id])
REFERENCES [mtc_admin].[checkStatus] ([id])
GO
ALTER TABLE [mtc_admin].[check] CHECK CONSTRAINT [FK_check_checkStatus_id_checkStatus_id]
GO
ALTER TABLE [mtc_admin].[check]  WITH CHECK ADD  CONSTRAINT [FK_check_checkWindow_id] FOREIGN KEY([checkWindow_id])
REFERENCES [mtc_admin].[checkWindow] ([id])
GO
ALTER TABLE [mtc_admin].[check] CHECK CONSTRAINT [FK_check_checkWindow_id]
GO
ALTER TABLE [mtc_admin].[check]  WITH CHECK ADD  CONSTRAINT [FK_check_createdBy_userId] FOREIGN KEY([createdBy_userId])
REFERENCES [mtc_admin].[user] ([id])
GO
ALTER TABLE [mtc_admin].[check] CHECK CONSTRAINT [FK_check_createdBy_userId]
GO
ALTER TABLE [mtc_admin].[check]  WITH CHECK ADD  CONSTRAINT [FK_check_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [mtc_admin].[pupil] ([id])
GO
ALTER TABLE [mtc_admin].[check] CHECK CONSTRAINT [FK_check_pupil_id]
GO
ALTER TABLE [mtc_admin].[checkConfig]  WITH CHECK ADD  CONSTRAINT [FK_checkConfig_check_id] FOREIGN KEY([check_id])
REFERENCES [mtc_admin].[check] ([id])
GO
ALTER TABLE [mtc_admin].[checkConfig] CHECK CONSTRAINT [FK_checkConfig_check_id]
GO
ALTER TABLE [mtc_admin].[checkFormWindow]  WITH CHECK ADD  CONSTRAINT [checkFormWindow_checkForm_id_fk] FOREIGN KEY([checkForm_id])
REFERENCES [mtc_admin].[checkForm] ([id])
GO
ALTER TABLE [mtc_admin].[checkFormWindow] CHECK CONSTRAINT [checkFormWindow_checkForm_id_fk]
GO
ALTER TABLE [mtc_admin].[checkFormWindow]  WITH CHECK ADD  CONSTRAINT [checkFormWindow_checkWindow_id_fk] FOREIGN KEY([checkWindow_id])
REFERENCES [mtc_admin].[checkWindow] ([id])
GO
ALTER TABLE [mtc_admin].[checkFormWindow] CHECK CONSTRAINT [checkFormWindow_checkWindow_id_fk]
GO
ALTER TABLE [mtc_admin].[checkPin]  WITH CHECK ADD  CONSTRAINT [FK_checkPin_check_id_check_id] FOREIGN KEY([check_id])
REFERENCES [mtc_admin].[check] ([id])
GO
ALTER TABLE [mtc_admin].[checkPin] CHECK CONSTRAINT [FK_checkPin_check_id_check_id]
GO
ALTER TABLE [mtc_admin].[checkPin]  WITH CHECK ADD  CONSTRAINT [FK_checkPin_pin_id_pin_id] FOREIGN KEY([pin_id])
REFERENCES [mtc_admin].[pin] ([id])
GO
ALTER TABLE [mtc_admin].[checkPin] CHECK CONSTRAINT [FK_checkPin_pin_id_pin_id]
GO
ALTER TABLE [mtc_admin].[checkPin]  WITH CHECK ADD  CONSTRAINT [FK_checkPin_school_id_school_id] FOREIGN KEY([school_id])
REFERENCES [mtc_admin].[school] ([id])
GO
ALTER TABLE [mtc_admin].[checkPin] CHECK CONSTRAINT [FK_checkPin_school_id_school_id]
GO
ALTER TABLE [mtc_admin].[checkScore]  WITH CHECK ADD  CONSTRAINT [FK_checkScores_checkId_check_id] FOREIGN KEY([checkId])
REFERENCES [mtc_admin].[check] ([id])
GO
ALTER TABLE [mtc_admin].[checkScore] CHECK CONSTRAINT [FK_checkScores_checkId_check_id]
GO
ALTER TABLE [mtc_admin].[group]  WITH CHECK ADD  CONSTRAINT [group_school_id_fk] FOREIGN KEY([school_id])
REFERENCES [mtc_admin].[school] ([id])
GO
ALTER TABLE [mtc_admin].[group] CHECK CONSTRAINT [group_school_id_fk]
GO
ALTER TABLE [mtc_admin].[hdf]  WITH CHECK ADD  CONSTRAINT [FK_hdf_checkWindow_id] FOREIGN KEY([checkWindow_id])
REFERENCES [mtc_admin].[checkWindow] ([id])
GO
ALTER TABLE [mtc_admin].[hdf] CHECK CONSTRAINT [FK_hdf_checkWindow_id]
GO
ALTER TABLE [mtc_admin].[hdf]  WITH CHECK ADD  CONSTRAINT [FK_hdf_school_id] FOREIGN KEY([school_id])
REFERENCES [mtc_admin].[school] ([id])
GO
ALTER TABLE [mtc_admin].[hdf] CHECK CONSTRAINT [FK_hdf_school_id]
GO
ALTER TABLE [mtc_admin].[hdf]  WITH CHECK ADD  CONSTRAINT [FK_hdf_user_id] FOREIGN KEY([user_id])
REFERENCES [mtc_admin].[user] ([id])
GO
ALTER TABLE [mtc_admin].[hdf] CHECK CONSTRAINT [FK_hdf_user_id]
GO
ALTER TABLE [mtc_admin].[job]  WITH CHECK ADD  CONSTRAINT [FK_job_jobStatus_id] FOREIGN KEY([jobStatus_id])
REFERENCES [mtc_admin].[jobStatus] ([id])
GO
ALTER TABLE [mtc_admin].[job] CHECK CONSTRAINT [FK_job_jobStatus_id]
GO
ALTER TABLE [mtc_admin].[job]  WITH CHECK ADD  CONSTRAINT [FK_job_jobType_id] FOREIGN KEY([jobType_id])
REFERENCES [mtc_admin].[jobType] ([id])
GO
ALTER TABLE [mtc_admin].[job] CHECK CONSTRAINT [FK_job_jobType_id]
GO
ALTER TABLE [mtc_admin].[psychometricianReportCache]  WITH CHECK ADD FOREIGN KEY([check_id])
REFERENCES [mtc_admin].[check] ([id])
GO
ALTER TABLE [mtc_admin].[pupil]  WITH CHECK ADD  CONSTRAINT [FK_pupil_job_id] FOREIGN KEY([job_id])
REFERENCES [mtc_admin].[job] ([id])
GO
ALTER TABLE [mtc_admin].[pupil] CHECK CONSTRAINT [FK_pupil_job_id]
GO
ALTER TABLE [mtc_admin].[pupil]  WITH CHECK ADD  CONSTRAINT [FK_pupil_pupilAgeReason_id] FOREIGN KEY([pupilAgeReason_id])
REFERENCES [mtc_admin].[pupilAgeReason] ([id])
GO
ALTER TABLE [mtc_admin].[pupil] CHECK CONSTRAINT [FK_pupil_pupilAgeReason_id]
GO
ALTER TABLE [mtc_admin].[pupil]  WITH CHECK ADD  CONSTRAINT [FK_pupil_school_id] FOREIGN KEY([school_id])
REFERENCES [mtc_admin].[school] ([id])
GO
ALTER TABLE [mtc_admin].[pupil] CHECK CONSTRAINT [FK_pupil_school_id]
GO
ALTER TABLE [mtc_admin].[pupil]  WITH CHECK ADD  CONSTRAINT [pupil_attendanceCode_id_fk] FOREIGN KEY([attendanceId])
REFERENCES [mtc_admin].[attendanceCode] ([id])
GO
ALTER TABLE [mtc_admin].[pupil] CHECK CONSTRAINT [pupil_attendanceCode_id_fk]
GO
ALTER TABLE [mtc_admin].[pupil]  WITH CHECK ADD  CONSTRAINT [pupil_check_id_fk] FOREIGN KEY([currentCheckId])
REFERENCES [mtc_admin].[check] ([id])
GO
ALTER TABLE [mtc_admin].[pupil] CHECK CONSTRAINT [pupil_check_id_fk]
GO
ALTER TABLE [mtc_admin].[pupil]  WITH CHECK ADD  CONSTRAINT [pupil_group_id_fk] FOREIGN KEY([group_id])
REFERENCES [mtc_admin].[group] ([id])
GO
ALTER TABLE [mtc_admin].[pupil] CHECK CONSTRAINT [pupil_group_id_fk]
GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements]  WITH CHECK ADD  CONSTRAINT [FK_pupilAccessArrangements_accessArrangements_id] FOREIGN KEY([accessArrangements_id])
REFERENCES [mtc_admin].[accessArrangements] ([id])
GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements] CHECK CONSTRAINT [FK_pupilAccessArrangements_accessArrangements_id]
GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements]  WITH CHECK ADD  CONSTRAINT [FK_pupilAccessArrangements_check_id] FOREIGN KEY([retroInputAssistant_check_id])
REFERENCES [mtc_admin].[check] ([id])
GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements] CHECK CONSTRAINT [FK_pupilAccessArrangements_check_id]
GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements]  WITH CHECK ADD  CONSTRAINT [FK_pupilAccessArrangements_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [mtc_admin].[pupil] ([id])
GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements] CHECK CONSTRAINT [FK_pupilAccessArrangements_pupil_id]
GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements]  WITH CHECK ADD  CONSTRAINT [FK_pupilAccessArrangements_pupilColourContrasts_id_pupilColourContrasts_id] FOREIGN KEY([pupilColourContrasts_Id])
REFERENCES [mtc_admin].[pupilColourContrasts] ([id])
GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements] CHECK CONSTRAINT [FK_pupilAccessArrangements_pupilColourContrasts_id_pupilColourContrasts_id]
GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements]  WITH CHECK ADD  CONSTRAINT [FK_pupilAccessArrangements_pupilFontSizes_id_pupilFontSizes_id] FOREIGN KEY([pupilFontSizes_id])
REFERENCES [mtc_admin].[pupilFontSizes] ([id])
GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements] CHECK CONSTRAINT [FK_pupilAccessArrangements_pupilFontSizes_id_pupilFontSizes_id]
GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements]  WITH CHECK ADD  CONSTRAINT [FK_pupilAccessArrangements_questionReaderReasons_id] FOREIGN KEY([questionReaderReasons_id])
REFERENCES [mtc_admin].[questionReaderReasons] ([id])
GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements] CHECK CONSTRAINT [FK_pupilAccessArrangements_questionReaderReasons_id]
GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements]  WITH CHECK ADD  CONSTRAINT [FK_pupilAccessArrangements_recordedBy_user_id] FOREIGN KEY([recordedBy_user_id])
REFERENCES [mtc_admin].[user] ([id])
GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements] CHECK CONSTRAINT [FK_pupilAccessArrangements_recordedBy_user_id]
GO
ALTER TABLE [mtc_admin].[pupilAgeReason]  WITH CHECK ADD  CONSTRAINT [FK_pupilAgeReason_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [mtc_admin].[pupil] ([id])
GO
ALTER TABLE [mtc_admin].[pupilAgeReason] CHECK CONSTRAINT [FK_pupilAgeReason_pupil_id]
GO
ALTER TABLE [mtc_admin].[pupilAttendance]  WITH CHECK ADD  CONSTRAINT [FK_pupilAttendance_attendanceCode_id] FOREIGN KEY([attendanceCode_id])
REFERENCES [mtc_admin].[attendanceCode] ([id])
GO
ALTER TABLE [mtc_admin].[pupilAttendance] CHECK CONSTRAINT [FK_pupilAttendance_attendanceCode_id]
GO
ALTER TABLE [mtc_admin].[pupilAttendance]  WITH CHECK ADD  CONSTRAINT [FK_pupilAttendance_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [mtc_admin].[pupil] ([id])
GO
ALTER TABLE [mtc_admin].[pupilAttendance] CHECK CONSTRAINT [FK_pupilAttendance_pupil_id]
GO
ALTER TABLE [mtc_admin].[pupilAttendance]  WITH CHECK ADD  CONSTRAINT [FK_pupilAttendance_user_id] FOREIGN KEY([recordedBy_user_id])
REFERENCES [mtc_admin].[user] ([id])
GO
ALTER TABLE [mtc_admin].[pupilAttendance] CHECK CONSTRAINT [FK_pupilAttendance_user_id]
GO
ALTER TABLE [mtc_admin].[pupilRestart]  WITH CHECK ADD  CONSTRAINT [FK_pupilRestart_check_id_check_id] FOREIGN KEY([check_id])
REFERENCES [mtc_admin].[check] ([id])
GO
ALTER TABLE [mtc_admin].[pupilRestart] CHECK CONSTRAINT [FK_pupilRestart_check_id_check_id]
GO
ALTER TABLE [mtc_admin].[pupilRestart]  WITH CHECK ADD  CONSTRAINT [FK_pupilRestart_deletedByUser_id] FOREIGN KEY([deletedByUser_id])
REFERENCES [mtc_admin].[user] ([id])
GO
ALTER TABLE [mtc_admin].[pupilRestart] CHECK CONSTRAINT [FK_pupilRestart_deletedByUser_id]
GO
ALTER TABLE [mtc_admin].[pupilRestart]  WITH CHECK ADD  CONSTRAINT [FK_pupilRestart_originCheck_id] FOREIGN KEY([originCheck_id])
REFERENCES [mtc_admin].[check] ([id])
GO
ALTER TABLE [mtc_admin].[pupilRestart] CHECK CONSTRAINT [FK_pupilRestart_originCheck_id]
GO
ALTER TABLE [mtc_admin].[pupilRestart]  WITH CHECK ADD  CONSTRAINT [FK_pupilRestart_pupil_id] FOREIGN KEY([pupil_id])
REFERENCES [mtc_admin].[pupil] ([id])
GO
ALTER TABLE [mtc_admin].[pupilRestart] CHECK CONSTRAINT [FK_pupilRestart_pupil_id]
GO
ALTER TABLE [mtc_admin].[pupilRestart]  WITH CHECK ADD  CONSTRAINT [FK_pupilRestart_pupilRestartReason_id] FOREIGN KEY([pupilRestartReason_id])
REFERENCES [mtc_admin].[pupilRestartReason] ([id])
GO
ALTER TABLE [mtc_admin].[pupilRestart] CHECK CONSTRAINT [FK_pupilRestart_pupilRestartReason_id]
GO
ALTER TABLE [mtc_admin].[pupilRestart]  WITH CHECK ADD  CONSTRAINT [FK_pupilRestart_recordedByUser_id] FOREIGN KEY([recordedByUser_id])
REFERENCES [mtc_admin].[user] ([id])
GO
ALTER TABLE [mtc_admin].[pupilRestart] CHECK CONSTRAINT [FK_pupilRestart_recordedByUser_id]
GO
ALTER TABLE [mtc_admin].[sce]  WITH CHECK ADD  CONSTRAINT [FK_sce_school_id] FOREIGN KEY([school_id])
REFERENCES [mtc_admin].[school] ([id])
GO
ALTER TABLE [mtc_admin].[sce] CHECK CONSTRAINT [FK_sce_school_id]
GO
ALTER TABLE [mtc_admin].[serviceMessage]  WITH CHECK ADD  CONSTRAINT [FK_serviceMessage_createdByUser_id] FOREIGN KEY([createdByUser_id])
REFERENCES [mtc_admin].[user] ([id])
GO
ALTER TABLE [mtc_admin].[serviceMessage] CHECK CONSTRAINT [FK_serviceMessage_createdByUser_id]
GO
ALTER TABLE [mtc_admin].[settingsLog]  WITH CHECK ADD  CONSTRAINT [FK_settingsLog_user_id] FOREIGN KEY([user_id])
REFERENCES [mtc_admin].[user] ([id])
GO
ALTER TABLE [mtc_admin].[settingsLog] CHECK CONSTRAINT [FK_settingsLog_user_id]
GO
ALTER TABLE [mtc_admin].[user]  WITH CHECK ADD  CONSTRAINT [FK_user_role_id] FOREIGN KEY([role_id])
REFERENCES [mtc_admin].[role] ([id])
GO
ALTER TABLE [mtc_admin].[user] CHECK CONSTRAINT [FK_user_role_id]
GO
ALTER TABLE [mtc_admin].[user]  WITH CHECK ADD  CONSTRAINT [FK_user_school_id] FOREIGN KEY([school_id])
REFERENCES [mtc_admin].[school] ([id])
GO
ALTER TABLE [mtc_admin].[user] CHECK CONSTRAINT [FK_user_school_id]
GO
ALTER TABLE [mtc_results].[answer]  WITH CHECK ADD  CONSTRAINT [FK_answer_checkResult_id_checkResult_id] FOREIGN KEY([checkResult_id])
REFERENCES [mtc_results].[checkResult] ([id])
GO
ALTER TABLE [mtc_results].[answer] CHECK CONSTRAINT [FK_answer_checkResult_id_checkResult_id]
GO
ALTER TABLE [mtc_results].[answer]  WITH CHECK ADD  CONSTRAINT [FK_answer_question_id] FOREIGN KEY([question_id])
REFERENCES [mtc_admin].[question] ([id])
GO
ALTER TABLE [mtc_results].[answer] CHECK CONSTRAINT [FK_answer_question_id]
GO
ALTER TABLE [mtc_results].[checkResult]  WITH CHECK ADD  CONSTRAINT [FK_checkResult_check_id_check_id] FOREIGN KEY([check_id])
REFERENCES [mtc_admin].[check] ([id])
GO
ALTER TABLE [mtc_results].[checkResult] CHECK CONSTRAINT [FK_checkResult_check_id_check_id]
GO
ALTER TABLE [mtc_results].[checkResult]  WITH CHECK ADD  CONSTRAINT [FK_checkResult_userDevice_id] FOREIGN KEY([userDevice_id])
REFERENCES [mtc_results].[userDevice] ([id])
GO
ALTER TABLE [mtc_results].[checkResult] CHECK CONSTRAINT [FK_checkResult_userDevice_id]
GO
ALTER TABLE [mtc_results].[event]  WITH CHECK ADD  CONSTRAINT [FK_event_checkResult_id] FOREIGN KEY([checkResult_id])
REFERENCES [mtc_results].[checkResult] ([id])
GO
ALTER TABLE [mtc_results].[event] CHECK CONSTRAINT [FK_event_checkResult_id]
GO
ALTER TABLE [mtc_results].[event]  WITH CHECK ADD  CONSTRAINT [FK_event_eventTypeLookup_id] FOREIGN KEY([eventTypeLookup_id])
REFERENCES [mtc_results].[eventTypeLookup] ([id])
GO
ALTER TABLE [mtc_results].[event] CHECK CONSTRAINT [FK_event_eventTypeLookup_id]
GO
ALTER TABLE [mtc_results].[event]  WITH CHECK ADD  CONSTRAINT [FK_event_question_id] FOREIGN KEY([question_id])
REFERENCES [mtc_admin].[question] ([id])
GO
ALTER TABLE [mtc_results].[event] CHECK CONSTRAINT [FK_event_question_id]
GO
ALTER TABLE [mtc_results].[userDevice]  WITH CHECK ADD  CONSTRAINT [FK_browserFamilyLookup_id] FOREIGN KEY([browserFamilyLookup_id])
REFERENCES [mtc_results].[browserFamilyLookup] ([id])
GO
ALTER TABLE [mtc_results].[userDevice] CHECK CONSTRAINT [FK_browserFamilyLookup_id]
GO
ALTER TABLE [mtc_results].[userDevice]  WITH CHECK ADD  CONSTRAINT [FK_deviceOrientationLookup_id] FOREIGN KEY([deviceOrientationLookup_id])
REFERENCES [mtc_results].[deviceOrientationLookup] ([id])
GO
ALTER TABLE [mtc_results].[userDevice] CHECK CONSTRAINT [FK_deviceOrientationLookup_id]
GO
ALTER TABLE [mtc_results].[userDevice]  WITH CHECK ADD  CONSTRAINT [FK_navigatorLanguageLookup_id] FOREIGN KEY([navigatorLanguageLookup_id])
REFERENCES [mtc_results].[navigatorLanguageLookup] ([id])
GO
ALTER TABLE [mtc_results].[userDevice] CHECK CONSTRAINT [FK_navigatorLanguageLookup_id]
GO
ALTER TABLE [mtc_results].[userDevice]  WITH CHECK ADD  CONSTRAINT [FK_navigatorPlatformLookup_id] FOREIGN KEY([navigatorPlatformLookup_id])
REFERENCES [mtc_results].[navigatorPlatformLookup] ([id])
GO
ALTER TABLE [mtc_results].[userDevice] CHECK CONSTRAINT [FK_navigatorPlatformLookup_id]
GO
ALTER TABLE [mtc_results].[userDevice]  WITH CHECK ADD  CONSTRAINT [FK_networkConnectionEffectiveTypeLookup_id] FOREIGN KEY([networkConnectionEffectiveTypeLookup_id])
REFERENCES [mtc_results].[networkConnectionEffectiveTypeLookup] ([id])
GO
ALTER TABLE [mtc_results].[userDevice] CHECK CONSTRAINT [FK_networkConnectionEffectiveTypeLookup_id]
GO
ALTER TABLE [mtc_results].[userDevice]  WITH CHECK ADD  CONSTRAINT [FK_uaOperatingSystemLookup_id] FOREIGN KEY([uaOperatingSystemLookup_id])
REFERENCES [mtc_results].[uaOperatingSystemLookup] ([id])
GO
ALTER TABLE [mtc_results].[userDevice] CHECK CONSTRAINT [FK_uaOperatingSystemLookup_id]
GO
ALTER TABLE [mtc_results].[userDevice]  WITH CHECK ADD  CONSTRAINT [FK_userAgentLookup_id] FOREIGN KEY([userAgentLookup_id])
REFERENCES [mtc_results].[userAgentLookup] ([id])
GO
ALTER TABLE [mtc_results].[userDevice] CHECK CONSTRAINT [FK_userAgentLookup_id]
GO
ALTER TABLE [mtc_results].[userInput]  WITH CHECK ADD  CONSTRAINT [FK_userInput_answer_id] FOREIGN KEY([answer_id])
REFERENCES [mtc_results].[answer] ([id])
GO
ALTER TABLE [mtc_results].[userInput] CHECK CONSTRAINT [FK_userInput_answer_id]
GO
ALTER TABLE [mtc_results].[userInput]  WITH CHECK ADD  CONSTRAINT [FK_userInput_userInputTypeLookup_id] FOREIGN KEY([userInputTypeLookup_id])
REFERENCES [mtc_results].[userInputTypeLookup] ([id])
GO
ALTER TABLE [mtc_results].[userInput] CHECK CONSTRAINT [FK_userInput_userInputTypeLookup_id]
GO
ALTER TABLE [mtc_admin].[serviceMessage]  WITH CHECK ADD  CONSTRAINT [CK_serviceMessage_Locked] CHECK  (([id]=(1)))
GO
ALTER TABLE [mtc_admin].[serviceMessage] CHECK CONSTRAINT [CK_serviceMessage_Locked]
GO
ALTER TABLE [mtc_results].[browserFamilyLookup]  WITH CHECK ADD  CONSTRAINT [browserFamilyLookup_uppercase] CHECK  (([family]=(Trim(upper([family]))) collate Latin1_General_CI_AI))
GO
ALTER TABLE [mtc_results].[browserFamilyLookup] CHECK CONSTRAINT [browserFamilyLookup_uppercase]
GO
ALTER TABLE [mtc_results].[navigatorLanguageLookup]  WITH CHECK ADD  CONSTRAINT [navigatorLanguageLookup_platformLang_uppercase] CHECK  (([platformLang]=(Trim(upper([platformLang]))) collate Latin1_General_CI_AI))
GO
ALTER TABLE [mtc_results].[navigatorLanguageLookup] CHECK CONSTRAINT [navigatorLanguageLookup_platformLang_uppercase]
GO
ALTER TABLE [mtc_results].[navigatorPlatformLookup]  WITH CHECK ADD  CONSTRAINT [navigatorPlatformLookup_platform_uppercase] CHECK  (([platform]=(Trim(upper([platform]))) collate Latin1_General_CI_AI))
GO
ALTER TABLE [mtc_results].[navigatorPlatformLookup] CHECK CONSTRAINT [navigatorPlatformLookup_platform_uppercase]
GO
ALTER TABLE [mtc_results].[uaOperatingSystemLookup]  WITH CHECK ADD  CONSTRAINT [uaOperatingSystemLookup_uppercase] CHECK  (([os]=(Trim(upper([os]))) collate Latin1_General_CI_AI))
GO
ALTER TABLE [mtc_results].[uaOperatingSystemLookup] CHECK CONSTRAINT [uaOperatingSystemLookup_uppercase]
GO
/****** Object:  StoredProcedure [mtc_admin].[spCreateChecks]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [mtc_admin].[spCreateChecks]
@TVP [mtc_admin].[CheckTableType] READONLY
AS
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_WARNINGS ON
SET ANSI_PADDING ON

-- only proceed if school has an active pin
DECLARE @school_id int
SELECT TOP 1 @school_id = school_id FROM @TVP
IF NOT EXISTS (SELECT id FROM mtc_admin.school
    WHERE (id = @school_id AND pin IS NOT NULL
    AND (pinExpiresAt IS NOT NULL AND pinExpiresAt > GETUTCDATE())))
    RAISERROR ('50001: School has no valid pin', 18, 1)

-- Connection pooling is enabled - make sure we are not in an existing transaction
IF @@TRANCOUNT <> 0  -- Rollback old transactions before starting another
    ROLLBACK TRANSACTION

BEGIN TRY
    BEGIN TRANSACTION

        DECLARE checkArgsList CURSOR
            FOR SELECT pupil_id, checkForm_id, checkWindow_id, isLiveCheck, pinExpiresAt, school_id, createdBy_userId
                FROM @TVP
            FOR READ ONLY

        DECLARE @pupilId int
        DECLARE @checkFormId int
        DECLARE @checkWindowId int
        DECLARE @isLiveCheck bit
        DECLARE @pinExpiresAt datetimeoffset
        DECLARE @schoolId int
        DECLARE @createdBy_userId int
        DEClARE @checkId int
        DECLARE @output TABLE (id int);
        DECLARE @isRestart bit;
        DECLARE @pupilRestartId int;

        OPEN checkArgsList
        FETCH checkArgsList INTO @pupilId, @checkFormId, @checkWindowId, @isLiveCheck, @pinExpiresAt, @schoolId, @createdBy_userId
        WHILE (@@FETCH_STATUS = 0) BEGIN

            -- Create the check
            INSERT INTO [mtc_admin].[check]
            (pupil_id, checkForm_id, checkWindow_id, isLiveCheck, createdBy_userId)
            VALUES (@pupilId, @checkFormId, @checkWindowId, @isLiveCheck, @createdBy_userId);

            -- Get the check.id we just inserted
            SET @checkId = SCOPE_IDENTITY();

            -- Assign a pin to the check
            INSERT INTO [mtc_admin].[checkPin] (school_id, check_id, pinExpiresAt, pin_id)
            VALUES (
                @schoolId,
                @checkId,
                @pinExpiresAt,
                (SELECT TOP 1 id
                   FROM (SELECT id
                           FROM mtc_admin.pin EXCEPT
                         SELECT pin_id
                           FROM mtc_admin.checkPin
                          WHERE school_id = @schoolId) as vew
                  ORDER BY NEWID())
            );


            IF @isLiveCheck = 1
                BEGIN
                    -- If the pupil is consuming a restart we need to mark it in the restart table
                    SELECT
                            @isRestart = restartAvailable
                    FROM [mtc_admin].[pupil]
                    WHERE id = @pupilId;

                    IF @isRestart = 1
                        BEGIN
                            -- Find the pupilRestart id so we can update it
                            SELECT
                                @pupilRestartId = id
                            FROM
                                [mtc_admin].[pupilRestart]
                            WHERE id = (
                                SELECT max(id)
                                FROM [mtc_admin].[pupilRestart]
                                WHERE pupil_id = @pupilId
                                  AND  isDeleted = 0
                            );

                            IF @pupilRestartId IS NULL
                                THROW 51000, 'Failed to find open pupilRestart for pupil', 1;

                            -- Consume the pupil restart
                            UPDATE [mtc_admin].[pupilRestart]
                            SET check_id = @checkId
                            WHERE id = @pupilRestartId;
                        END

                    -- Update the pupil state
                    UPDATE [mtc_admin].[pupil]
                    SET currentCheckId = @checkId,
                        checkComplete = 0,
                        restartAvailable = 0
                    WHERE id = @pupilId;
                END

            -- Store the check.id in the output table
            INSERT INTO @output (id) (SELECT @checkId);

            FETCH checkArgsList INTO @pupilId, @checkFormId, @checkWindowId, @isLiveCheck, @pinExpiresAt, @schoolId, @createdBy_userId
        END

    COMMIT TRANSACTION

    -- OUTPUT newly created checks to the caller
    SELECT
      chk.id as check_id,
      chk.checkCode as check_checkCode,
      chk.isLiveCheck as check_isLiveCheck,
      chk.createdBy_userId as check_createdBy_userId,
      pin.val as pupil_pin,
      cp.pinExpiresAt as pupil_pinExpiresAt,
      pupil.id as pupil_id,
      pupil.foreName as pupil_foreName,
      pupil.lastName as pupil_lastName,
      pupil.foreNameAlias as pupil_foreNameAlias,
      pupil.lastNameAlias as pupil_lastNameAlias,
      pupil.dateOfBirth as pupil_dateOfBirth,
      pupil.urlSlug as pupil_uuid,
      pupil.jwtToken as pupil_jwtToken,
      checkForm.id as checkForm_id,
      checkForm.formData as checkForm_formData,
      school.id as school_id,
      school.urlSlug as school_uuid,
      school.name as school_name,
      school.pin as school_pin,
      school.pinExpiresAt as school_pinExpiresAt,
      ISNULL(sce.timezone, 'Europe/London') as timezone
    FROM
      [mtc_admin].[check] chk
      INNER JOIN [mtc_admin].[pupil] pupil ON (chk.pupil_id = pupil.id)
      INNER JOIN [mtc_admin].[checkForm] checkForm ON (chk.checkForm_id = checkForm.id)
      INNER JOIN [mtc_admin].[school] school on (pupil.school_id = school.id)
      INNER JOIN [mtc_admin].[checkPin] cp on (chk.id = cp.check_id)
      INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
      LEFT JOIN [mtc_admin].sce ON (sce.school_id = school.id)
    WHERE chk.id IN (SELECT id from @output);

    CLOSE checkArgsList
    DEALLOCATE checkArgsList

END TRY
BEGIN CATCH
    IF (@@TRANCOUNT > 0)
        BEGIN
            ROLLBACK TRANSACTION
            PRINT 'Error detected, all changes reversed'
        END
    DECLARE @ErrorMessage NVARCHAR(4000);
    DECLARE @ErrorSeverity INT;
    DECLARE @ErrorState INT;

    SELECT @ErrorMessage = ERROR_MESSAGE(),
           @ErrorSeverity = ERROR_SEVERITY(),
           @ErrorState = ERROR_STATE();

    -- Use RAISERROR inside the CATCH block to return
    -- error information about the original error that
    -- caused execution to jump to the CATCH block.
    RAISERROR (@ErrorMessage, -- Message text.
        @ErrorSeverity, -- Severity.
        @ErrorState -- State.
        );
END CATCH

GO
/****** Object:  StoredProcedure [mtc_admin].[spGenAuditTriggers]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [mtc_admin].[spGenAuditTriggers] AS

  DECLARE @schema NVARCHAR(20) = 'mtc_admin'
  DECLARE @table NVARCHAR(255)
  DECLARE @sql NVARCHAR(MAX)
  DECLARE @triggerName NVARCHAR(MAX)
  DECLARE @dropSql NVARCHAR(MAX)

  DECLARE db_cursor CURSOR FOR
    SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_TYPE='BASE TABLE'
    AND TABLE_SCHEMA=@schema
    AND TABLE_NAME != 'auditLog'
    AND TABLE_NAME != 'sessions'
    AND TABLE_NAME != 'adminLogonEvent';

  OPEN db_cursor
  FETCH NEXT FROM db_cursor INTO @schema, @table

  WHILE @@FETCH_STATUS = 0
    BEGIN
      SELECT @triggerName = @schema + '.audit_' + @table
      SELECT @dropSql = 'DROP TRIGGER IF EXISTS ' + @triggerName
      EXEC sp_executeSql @dropSql
      SELECT @sql = 'CREATE TRIGGER ' + @triggerName + ' ON [' + @schema + '].[' + @table + '] FOR UPDATE, INSERT, DELETE
AS
  BEGIN
    DECLARE @json nvarchar(max)
    DECLARE @table nvarchar(255) = ''' + @table + '''
    DECLARE @operation varchar(50)='''';
    IF EXISTS (SELECT * FROM inserted) and  EXISTS (SELECT * FROM deleted)
    BEGIN
      SELECT @operation = ''UPDATE''
      SELECT @json = (SELECT * FROM inserted FOR JSON PATH, ROOT(''' + @table +  '''))
    END
    ELSE IF EXISTS(SELECT * FROM inserted)
    BEGIN
      SELECT @operation = ''INSERT''
      SELECT @json = (SELECT * FROM inserted FOR JSON PATH, ROOT(''' + @table +  '''))
    END
    ELSE IF EXISTS(SELECT * FROM deleted)
    BEGIN
      SELECT @operation = ''DELETE''
      SELECT @json = (SELECT * FROM deleted FOR JSON PATH, ROOT(''' + @table +  '''))
    END
    ELSE
      RETURN

    INSERT INTO ' + @schema + '.auditLog (rowData, tableName, operation) VALUES (@json, ''' + @table + ''', @operation)
  END'
      -- PRINT @sql
      EXEC sp_executeSql @sql

      FETCH NEXT FROM db_cursor INTO @schema, @table
    END

  CLOSE db_cursor
  DEALLOCATE db_cursor
;
GO
/****** Object:  StoredProcedure [mtc_admin].[spUpsertSceSchools]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [mtc_admin].[spUpsertSceSchools]
    @sceSchools [mtc_admin].[SceTableType] READONLY
AS
    IF @@TRANCOUNT <> 0
        ROLLBACK TRANSACTION

    BEGIN TRY
    BEGIN TRANSACTION

    MERGE INTO
        mtc_admin.sce AS Target
    USING
        @sceSchools AS Source
    ON Target.school_id = Source.school_id
    WHEN MATCHED THEN
        UPDATE SET Target.timezone = Source.timezone, Target.countryCode = Source.countryCode
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (school_id, timezone, countryCode, isOpen) VALUES (Source.school_id, Source.timezone, Source.countryCode, Source.isOpen)
    WHEN NOT MATCHED BY SOURCE THEN
        DELETE;

    COMMIT TRANSACTION

    END TRY
    BEGIN CATCH
        IF (@@TRANCOUNT > 0)
            BEGIN
                ROLLBACK TRANSACTION
                PRINT 'Error detected, all changes reversed'
            END
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT  @ErrorMessage = ERROR_MESSAGE(),
                @ErrorSeverity = ERROR_SEVERITY(),
                @ErrorState = ERROR_STATE();

        -- Use RAISERROR inside the CATCH block to return
        -- error information about the original error that
        -- caused execution to jump to the CATCH block.
        RAISERROR (@ErrorMessage, -- Message text.
            @ErrorSeverity, -- Severity.
            @ErrorState -- State.
        );
    END CATCH

GO
/****** Object:  StoredProcedure [mtc_census_import].[spPupilCensusImportFromStaging]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [mtc_census_import].[spPupilCensusImportFromStaging]
  (
    @censusImportTable AS censusImportTableType READONLY,
    @jobId AS INT
  )
  AS
  DECLARE Source CURSOR
    FOR SELECT
          school.id,
          school.dfeNumber,
          census.foreName,
          census.middlenames,
          census.surname as lastName,
          census.gender,
          census.dob as dateOfBirth,
          census.upn
        FROM @censusImportTable as census JOIN
             [mtc_admin].[school] school ON (school.dfeNumber = CONVERT(INT, CONCAT(census.lea, census.estab)))
    FOR READ ONLY

  DECLARE @schoolId INT
  DECLARE @foreName NVARCHAR(max)
  DECLARE @lastName NVARCHAR(max)
  DECLARE @middleNames NVARCHAR(max)
  DECLARE @gender NVARCHAR(max)
  DECLARE @dateOfBirth NVARCHAR(max)
  DECLARE @upn NVARCHAR(max)
  DECLARE @insertCount INT = 0
  DECLARE @errorCount INT = 0
  DECLARE @lineCount INT = 0
  DECLARE @errorText NVARCHAR(max) = ''
  DECLARE @dfeNumber INT

  -- Insert all new pupils
  OPEN Source
  FETCH Source INTO @schoolId, @dfeNumber, @foreName, @middleNames, @lastName, @gender, @dateOfBirth, @upn
  WHILE (@@FETCH_STATUS = 0) BEGIN
    BEGIN TRY
      SET @lineCount += 1;
      INSERT INTO [mtc_admin].[pupil]
      (school_id, foreName, middleNames, lastName, gender, dateOfBirth, upn, job_id)
      VALUES
      (@schoolId, @foreName, @middleNames, @lastName, @gender, CONVERT(DATETIMEOFFSET, @dateOfBirth, 103), @upn, @jobId);
      SET @insertCount += 1;
    END TRY
    BEGIN CATCH
      SET @errorCount += 1;

      IF (@errorCount <=  100)
        BEGIN
          IF LEN(@errorText) > 0
            SET @errorText += CHAR(10)
          SET @errorText += 'Error inserting pupil for dfeNumber ' + CONVERT(VARCHAR, @dfeNumber) + ', line ' + CONVERT(VARCHAR, @lineCount + 1) + ': ' + ERROR_MESSAGE()
        END
      ELSE IF @errorCount = 101
        SET @errorText += CHAR(10) + CHAR(10) + 'Too many errors; remaining errors have been omitted'
    END CATCH
    FETCH Source INTO @schoolId, @dfeNumber, @foreName, @middleNames, @lastName, @gender, @dateOfBirth, @upn
  END

  SELECT @insertCount as insertCount, @errorCount as errorCount, @errorText as errorText;

  CLOSE Source
  DEALLOCATE Source
  ;

GO
/****** Object:  Trigger [mtc_admin].[accessArrangementsUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:24 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[accessArrangementsUpdatedAtTrigger]
    ON [mtc_admin].[accessArrangements]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[accessArrangements]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [accessArrangements].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[accessArrangements] ENABLE TRIGGER [accessArrangementsUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[adminLogonEventUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[adminLogonEventUpdatedAtTrigger]
    ON [mtc_admin].[adminLogonEvent]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[adminLogonEvent]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [adminLogonEvent].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[adminLogonEvent] ENABLE TRIGGER [adminLogonEventUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[anomalyReportCacheUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[anomalyReportCacheUpdatedAtTrigger]
    ON [mtc_admin].[anomalyReportCache]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[anomalyReportCache]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [anomalyReportCache].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[anomalyReportCache] ENABLE TRIGGER [anomalyReportCacheUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[answerUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[answerUpdatedAtTrigger]
    ON [mtc_admin].[answer]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[answer]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [answer].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[answer] ENABLE TRIGGER [answerUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[attendanceCodeUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[attendanceCodeUpdatedAtTrigger]
    ON [mtc_admin].[attendanceCode]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[attendanceCode]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [attendanceCode].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[attendanceCode] ENABLE TRIGGER [attendanceCodeUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[azureBlobFileUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[azureBlobFileUpdatedAtTrigger]
    ON [mtc_admin].[azureBlobFile]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[azureBlobFile]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [azureBlobFile].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[azureBlobFile] ENABLE TRIGGER [azureBlobFileUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[azureBlobFileTypeUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[azureBlobFileTypeUpdatedAtTrigger]
    ON [mtc_admin].[azureBlobFileType]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[azureBlobFileType]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [azureBlobFileType].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[azureBlobFileType] ENABLE TRIGGER [azureBlobFileTypeUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[checkUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[checkUpdatedAtTrigger]
    ON [mtc_admin].[check]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[check]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [check].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[check] ENABLE TRIGGER [checkUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[checkFormUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[checkFormUpdatedAtTrigger]
    ON [mtc_admin].[checkForm]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[checkForm]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [checkForm].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[checkForm] ENABLE TRIGGER [checkFormUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[checkScoreUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   TRIGGER [mtc_admin].[checkScoreUpdatedAtTrigger]
    ON [mtc_admin].[checkScore]
    FOR UPDATE
    AS
BEGIN
    UPDATE [mtc_admin].[checkScore]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [checkScore].id = inserted.id
END

GO
ALTER TABLE [mtc_admin].[checkScore] ENABLE TRIGGER [checkScoreUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[checkStatusUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[checkStatusUpdatedAtTrigger]
    ON [mtc_admin].[checkStatus]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[checkStatus]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [checkStatus].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[checkStatus] ENABLE TRIGGER [checkStatusUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[checkWindowUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[checkWindowUpdatedAtTrigger]
    ON [mtc_admin].[checkWindow]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[checkWindow]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [checkWindow].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[checkWindow] ENABLE TRIGGER [checkWindowUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[groupUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[groupUpdatedAtTrigger]
    ON [mtc_admin].[group]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[group]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [group].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[group] ENABLE TRIGGER [groupUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[hdfUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[hdfUpdatedAtTrigger]
    ON [mtc_admin].[hdf]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[hdf]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [hdf].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[hdf] ENABLE TRIGGER [hdfUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[jobUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[jobUpdatedAtTrigger]
    ON [mtc_admin].[job]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[job]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [job].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[job] ENABLE TRIGGER [jobUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[jobStatusUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[jobStatusUpdatedAtTrigger]
    ON [mtc_admin].[jobStatus]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[jobStatus]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [jobStatus].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[jobStatus] ENABLE TRIGGER [jobStatusUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[jobTypeUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[jobTypeUpdatedAtTrigger]
    ON [mtc_admin].[jobType]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[jobType]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [jobType].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[jobType] ENABLE TRIGGER [jobTypeUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[pinUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[pinUpdatedAtTrigger]
    ON [mtc_admin].[pin]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pin]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pin].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[pin] ENABLE TRIGGER [pinUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[psychometricianReportCacheUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[psychometricianReportCacheUpdatedAtTrigger]
    ON [mtc_admin].[psychometricianReportCache]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[psychometricianReportCache]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [psychometricianReportCache].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[psychometricianReportCache] ENABLE TRIGGER [psychometricianReportCacheUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[pupilUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[pupilUpdatedAtTrigger]
    ON [mtc_admin].[pupil]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupil]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupil].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[pupil] ENABLE TRIGGER [pupilUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[pupilAccessArrangementsUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[pupilAccessArrangementsUpdatedAtTrigger]
    ON [mtc_admin].[pupilAccessArrangements]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilAccessArrangements]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilAccessArrangements].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[pupilAccessArrangements] ENABLE TRIGGER [pupilAccessArrangementsUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[pupilAttendanceUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[pupilAttendanceUpdatedAtTrigger]
    ON [mtc_admin].[pupilAttendance]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilAttendance]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilAttendance].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[pupilAttendance] ENABLE TRIGGER [pupilAttendanceUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[pupilColourContrastsUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[pupilColourContrastsUpdatedAtTrigger]
    ON [mtc_admin].[pupilColourContrasts]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilColourContrasts]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilColourContrasts].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[pupilColourContrasts] ENABLE TRIGGER [pupilColourContrastsUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[pupilFontSizesUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:25 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[pupilFontSizesUpdatedAtTrigger]
    ON [mtc_admin].[pupilFontSizes]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilFontSizes]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilFontSizes].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[pupilFontSizes] ENABLE TRIGGER [pupilFontSizesUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[pupilRestartUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[pupilRestartUpdatedAtTrigger]
    ON [mtc_admin].[pupilRestart]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilRestart]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilRestart].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[pupilRestart] ENABLE TRIGGER [pupilRestartUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[pupilRestartCodeUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[pupilRestartCodeUpdatedAtTrigger]
    ON [mtc_admin].[pupilRestartCode]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilRestartCode]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilRestartCode].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[pupilRestartCode] ENABLE TRIGGER [pupilRestartCodeUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[pupilRestartReasonUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[pupilRestartReasonUpdatedAtTrigger]
    ON [mtc_admin].[pupilRestartReason]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[pupilRestartReason]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [pupilRestartReason].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[pupilRestartReason] ENABLE TRIGGER [pupilRestartReasonUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[questionUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   TRIGGER [mtc_admin].[questionUpdatedAtTrigger]
    ON [mtc_admin].[question]
    FOR UPDATE
    AS
BEGIN
    UPDATE [mtc_admin].[question]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [question].id = inserted.id
END

GO
ALTER TABLE [mtc_admin].[question] ENABLE TRIGGER [questionUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[questionReaderReasonsUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[questionReaderReasonsUpdatedAtTrigger]
    ON [mtc_admin].[questionReaderReasons]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[questionReaderReasons]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [questionReaderReasons].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[questionReaderReasons] ENABLE TRIGGER [questionReaderReasonsUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[roleUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[roleUpdatedAtTrigger]
    ON [mtc_admin].[role]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[role]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [role].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[role] ENABLE TRIGGER [roleUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[sceUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[sceUpdatedAtTrigger]
    ON [mtc_admin].[sce]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[sce]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [sce].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[sce] ENABLE TRIGGER [sceUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[schoolUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[schoolUpdatedAtTrigger]
    ON [mtc_admin].[school]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[school]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [school].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[school] ENABLE TRIGGER [schoolUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[serviceMessageUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   TRIGGER [mtc_admin].[serviceMessageUpdatedAtTrigger]
    ON [mtc_admin].[serviceMessage]
    FOR UPDATE
    AS
BEGIN
    UPDATE [mtc_admin].[serviceMessage]
       SET updatedAt = GETUTCDATE()
      FROM inserted
     WHERE [serviceMessage].id = inserted.id
END

GO
ALTER TABLE [mtc_admin].[serviceMessage] ENABLE TRIGGER [serviceMessageUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[settingsUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[settingsUpdatedAtTrigger]
    ON [mtc_admin].[settings]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[settings]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [settings].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[settings] ENABLE TRIGGER [settingsUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[settingsLogUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[settingsLogUpdatedAtTrigger]
    ON [mtc_admin].[settingsLog]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[settingsLog]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [settingsLog].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[settingsLog] ENABLE TRIGGER [settingsLogUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_admin].[user_school_id_null_check]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TRIGGER [mtc_admin].[user_school_id_null_check]
ON [mtc_admin].[user]
FOR INSERT, UPDATE
AS
IF UPDATE(school_id)
BEGIN
      IF EXISTS (SELECT * FROM inserted i WHERE i.school_id IS NULL AND i.role_id = 3)
      BEGIN
            THROW 50000, 'Users in Teacher role must be assigned to a school', 1;
      END
END

GO
ALTER TABLE [mtc_admin].[user] ENABLE TRIGGER [user_school_id_null_check]
GO
/****** Object:  Trigger [mtc_admin].[userUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE TRIGGER [mtc_admin].[userUpdatedAtTrigger]
    ON [mtc_admin].[user]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_admin].[user]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [user].id = inserted.id
    END

GO
ALTER TABLE [mtc_admin].[user] ENABLE TRIGGER [userUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_results].[answerUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE   TRIGGER [mtc_results].[answerUpdatedAtTrigger]
    ON [mtc_results].[answer]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_results].[answer]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [answer].id = inserted.id
    END

GO
ALTER TABLE [mtc_results].[answer] ENABLE TRIGGER [answerUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_results].[browserFamilyLookupUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE   TRIGGER [mtc_results].[browserFamilyLookupUpdatedAtTrigger]
    ON [mtc_results].[browserFamilyLookup]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_results].[browserFamilyLookup]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [browserFamilyLookup].id = inserted.id
    END

GO
ALTER TABLE [mtc_results].[browserFamilyLookup] ENABLE TRIGGER [browserFamilyLookupUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_results].[checkResultUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE   TRIGGER [mtc_results].[checkResultUpdatedAtTrigger]
    ON [mtc_results].[checkResult]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_results].[checkResult]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [checkResult].id = inserted.id
    END

GO
ALTER TABLE [mtc_results].[checkResult] ENABLE TRIGGER [checkResultUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_results].[deviceOrientationLookupUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE   TRIGGER [mtc_results].[deviceOrientationLookupUpdatedAtTrigger]
    ON [mtc_results].[deviceOrientationLookup]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_results].[deviceOrientationLookup]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [deviceOrientationLookup].id = inserted.id
    END

GO
ALTER TABLE [mtc_results].[deviceOrientationLookup] ENABLE TRIGGER [deviceOrientationLookupUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_results].[eventUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE   TRIGGER [mtc_results].[eventUpdatedAtTrigger]
    ON [mtc_results].[event]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_results].[event]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [event].id = inserted.id
    END

GO
ALTER TABLE [mtc_results].[event] ENABLE TRIGGER [eventUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_results].[eventTypeLookupUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE   TRIGGER [mtc_results].[eventTypeLookupUpdatedAtTrigger]
    ON [mtc_results].[eventTypeLookup]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_results].[eventTypeLookup]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [eventTypeLookup].id = inserted.id
    END

GO
ALTER TABLE [mtc_results].[eventTypeLookup] ENABLE TRIGGER [eventTypeLookupUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_results].[navigatorLanguageLookupUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE   TRIGGER [mtc_results].[navigatorLanguageLookupUpdatedAtTrigger]
    ON [mtc_results].[navigatorLanguageLookup]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_results].[navigatorLanguageLookup]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [navigatorLanguageLookup].id = inserted.id
    END

GO
ALTER TABLE [mtc_results].[navigatorLanguageLookup] ENABLE TRIGGER [navigatorLanguageLookupUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_results].[navigatorPlatformLookupUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE   TRIGGER [mtc_results].[navigatorPlatformLookupUpdatedAtTrigger]
    ON [mtc_results].[navigatorPlatformLookup]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_results].[navigatorPlatformLookup]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [navigatorPlatformLookup].id = inserted.id
    END

GO
ALTER TABLE [mtc_results].[navigatorPlatformLookup] ENABLE TRIGGER [navigatorPlatformLookupUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_results].[networkConnectionEffectiveTypeLookupUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE   TRIGGER [mtc_results].[networkConnectionEffectiveTypeLookupUpdatedAtTrigger]
    ON [mtc_results].[networkConnectionEffectiveTypeLookup]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_results].[networkConnectionEffectiveTypeLookup]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [networkConnectionEffectiveTypeLookup].id = inserted.id
    END

GO
ALTER TABLE [mtc_results].[networkConnectionEffectiveTypeLookup] ENABLE TRIGGER [networkConnectionEffectiveTypeLookupUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_results].[uaOperatingSystemLookupUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE   TRIGGER [mtc_results].[uaOperatingSystemLookupUpdatedAtTrigger]
    ON [mtc_results].[uaOperatingSystemLookup]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_results].[uaOperatingSystemLookup]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [uaOperatingSystemLookup].id = inserted.id
    END

GO
ALTER TABLE [mtc_results].[uaOperatingSystemLookup] ENABLE TRIGGER [uaOperatingSystemLookupUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_results].[userAgentLookupUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE   TRIGGER [mtc_results].[userAgentLookupUpdatedAtTrigger]
    ON [mtc_results].[userAgentLookup]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_results].[userAgentLookup]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [userAgentLookup].id = inserted.id
    END

GO
ALTER TABLE [mtc_results].[userAgentLookup] ENABLE TRIGGER [userAgentLookupUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_results].[userDeviceUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE   TRIGGER [mtc_results].[userDeviceUpdatedAtTrigger]
    ON [mtc_results].[userDevice]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_results].[userDevice]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [userDevice].id = inserted.id
    END

GO
ALTER TABLE [mtc_results].[userDevice] ENABLE TRIGGER [userDeviceUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_results].[userInputUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE   TRIGGER [mtc_results].[userInputUpdatedAtTrigger]
    ON [mtc_results].[userInput]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_results].[userInput]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [userInput].id = inserted.id
    END

GO
ALTER TABLE [mtc_results].[userInput] ENABLE TRIGGER [userInputUpdatedAtTrigger]
GO
/****** Object:  Trigger [mtc_results].[userInputTypeLookupUpdatedAtTrigger]    Script Date: 29/10/2020 17:26:26 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE   TRIGGER [mtc_results].[userInputTypeLookupUpdatedAtTrigger]
    ON [mtc_results].[userInputTypeLookup]
    FOR UPDATE
    AS
    BEGIN
        UPDATE [mtc_results].[userInputTypeLookup]
        SET updatedAt = GETUTCDATE()
        FROM inserted
        WHERE [userInputTypeLookup].id = inserted.id
    END

GO
ALTER TABLE [mtc_results].[userInputTypeLookup] ENABLE TRIGGER [userInputTypeLookupUpdatedAtTrigger]
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Synthetic ID' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'answer', @level2type=N'COLUMN',@level2name=N'id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was created. Not for application use.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'answer', @level2type=N'COLUMN',@level2name=N'createdAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was last updated. Not for application use.  Uses a trigger.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'answer', @level2type=N'COLUMN',@level2name=N'updatedAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FK to checkResult table.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'answer', @level2type=N'COLUMN',@level2name=N'checkResult_id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'The sequence in the form that the question appeared.  E.g. 1st of 25 questions.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'answer', @level2type=N'COLUMN',@level2name=N'questionNumber'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'The response from the pupil as an answer to a question.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'answer', @level2type=N'COLUMN',@level2name=N'answer'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FK to the question table detailing the question that was asked.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'answer', @level2type=N'COLUMN',@level2name=N'question_id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Set to true if the answer to the question is correct.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'answer', @level2type=N'COLUMN',@level2name=N'isCorrect'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'The timestamp the answer was provided, either because the pupil hit enter, or ran out of time.  This data is sourced from the pupils computer.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'answer', @level2type=N'COLUMN',@level2name=N'browserTimestamp'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Capture user answers for the check' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'answer'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Synthetic ID' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'browserFamilyLookup', @level2type=N'COLUMN',@level2name=N'id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was created. Not for application use.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'browserFamilyLookup', @level2type=N'COLUMN',@level2name=N'createdAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was last updated. Not for application use.  Uses a trigger.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'browserFamilyLookup', @level2type=N'COLUMN',@level2name=N'updatedAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'The name of the browser used to take the check' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'browserFamilyLookup', @level2type=N'COLUMN',@level2name=N'family'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Dynamically updated lookup table for web browser names' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'browserFamilyLookup'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Synthetic ID' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'checkResult', @level2type=N'COLUMN',@level2name=N'id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was created. Not for application use.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'checkResult', @level2type=N'COLUMN',@level2name=N'createdAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was last updated. Not for application use.  Uses a trigger.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'checkResult', @level2type=N'COLUMN',@level2name=N'updatedAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FK to the check table.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'checkResult', @level2type=N'COLUMN',@level2name=N'check_id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'The marks awarded for the check.  For MTC this equals the number of correctly answered questions.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'checkResult', @level2type=N'COLUMN',@level2name=N'mark'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'The server timestamp when the marking was applied.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'checkResult', @level2type=N'COLUMN',@level2name=N'markedAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FK to the userDevice table.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'checkResult', @level2type=N'COLUMN',@level2name=N'userDevice_id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Store the check results once the pupil has taken the check.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'checkResult'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Synthetic ID' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'deviceOrientationLookup', @level2type=N'COLUMN',@level2name=N'id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was created. Not for application use.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'deviceOrientationLookup', @level2type=N'COLUMN',@level2name=N'createdAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was last updated. Not for application use.  Uses a trigger.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'deviceOrientationLookup', @level2type=N'COLUMN',@level2name=N'updatedAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'The orientation of the screen used to take the check as obtained from the browser if supported.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'deviceOrientationLookup', @level2type=N'COLUMN',@level2name=N'orientation'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Dynamically updated lookup table for device screen orientations, e.g. portrait or landscape' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'deviceOrientationLookup'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Synthetic ID' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'event', @level2type=N'COLUMN',@level2name=N'id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was created. Not for application use.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'event', @level2type=N'COLUMN',@level2name=N'createdAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was last updated. Not for application use.  Uses a trigger.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'event', @level2type=N'COLUMN',@level2name=N'updatedAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FK to the checkResult table.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'event', @level2type=N'COLUMN',@level2name=N'checkResult_id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FK to the event type lookup.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'event', @level2type=N'COLUMN',@level2name=N'eventTypeLookup_id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'The timestamp the event was triggered.  This data is sourced from the pupils computer.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'event', @level2type=N'COLUMN',@level2name=N'browserTimestamp'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'JSON event-specific data' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'event', @level2type=N'COLUMN',@level2name=N'eventData'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FK to the mtc_admin.question table' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'event', @level2type=N'COLUMN',@level2name=N'question_id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'The sequence in the form that the question appeared.  E.g. 1st of 25 questions.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'event', @level2type=N'COLUMN',@level2name=N'questionNumber'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Store the check results once the pupil has taken the check.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'event'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Synthetic ID' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'eventTypeLookup', @level2type=N'COLUMN',@level2name=N'id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was created. Not for application use.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'eventTypeLookup', @level2type=N'COLUMN',@level2name=N'createdAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was last updated. Not for application use.  Uses a trigger.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'eventTypeLookup', @level2type=N'COLUMN',@level2name=N'updatedAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Event code, e.g. PageRendered' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'eventTypeLookup', @level2type=N'COLUMN',@level2name=N'eventType'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'A long description describing the event (which happens in the pupil app)' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'eventTypeLookup', @level2type=N'COLUMN',@level2name=N'eventDescription'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Lookup table to store events generated in the pupil app' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'eventTypeLookup'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Synthetic ID' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'navigatorLanguageLookup', @level2type=N'COLUMN',@level2name=N'id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was created. Not for application use.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'navigatorLanguageLookup', @level2type=N'COLUMN',@level2name=N'createdAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was last updated. Not for application use.  Uses a trigger.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'navigatorLanguageLookup', @level2type=N'COLUMN',@level2name=N'updatedAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Language setting exactly as reported by the web browser' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'navigatorLanguageLookup', @level2type=N'COLUMN',@level2name=N'platformLang'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Dynamically updated lookup table for storing the web browser''s language setting' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'navigatorLanguageLookup'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Synthetic ID' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'navigatorPlatformLookup', @level2type=N'COLUMN',@level2name=N'id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was created. Not for application use.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'navigatorPlatformLookup', @level2type=N'COLUMN',@level2name=N'createdAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was last updated. Not for application use.  Uses a trigger.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'navigatorPlatformLookup', @level2type=N'COLUMN',@level2name=N'updatedAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Platform setting as reported by the web browser. e.g. WIN32' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'navigatorPlatformLookup', @level2type=N'COLUMN',@level2name=N'platform'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Dynamically updated lookup table for storing the web browser''s platform setting' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'navigatorPlatformLookup'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Synthetic ID' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'networkConnectionEffectiveTypeLookup', @level2type=N'COLUMN',@level2name=N'id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was created. Not for application use.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'networkConnectionEffectiveTypeLookup', @level2type=N'COLUMN',@level2name=N'createdAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was last updated. Not for application use.  Uses a trigger.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'networkConnectionEffectiveTypeLookup', @level2type=N'COLUMN',@level2name=N'updatedAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Actual network speed classification as reported by the web browser. e.g. 4g' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'networkConnectionEffectiveTypeLookup', @level2type=N'COLUMN',@level2name=N'effectiveType'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Dynamically updated lookup table for storing the web browser''s network type setting - API: navigator.connection.effectiveType which gives network speed class experienced by the device. E.g. 2g, 3g, 4g' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'networkConnectionEffectiveTypeLookup'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Synthetic ID' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'uaOperatingSystemLookup', @level2type=N'COLUMN',@level2name=N'id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was created. Not for application use.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'uaOperatingSystemLookup', @level2type=N'COLUMN',@level2name=N'createdAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was last updated. Not for application use.  Uses a trigger.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'uaOperatingSystemLookup', @level2type=N'COLUMN',@level2name=N'updatedAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Operating sytem name as determined by parsing the user-agent string and converted to uppercase, e.g. WINDOWS' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'uaOperatingSystemLookup', @level2type=N'COLUMN',@level2name=N'os'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Dynamically updated lookup table for storing the Operating System as determined by parsing the user-agent field reported by the browser.  May not be accurate in all cases.  User-agents may be spoofed.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'uaOperatingSystemLookup'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Synthetic ID' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userAgentLookup', @level2type=N'COLUMN',@level2name=N'id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was created. Not for application use.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userAgentLookup', @level2type=N'COLUMN',@level2name=N'createdAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was last updated. Not for application use.  Uses a trigger.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userAgentLookup', @level2type=N'COLUMN',@level2name=N'updatedAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Raw user-agent as reported by the browser.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userAgentLookup', @level2type=N'COLUMN',@level2name=N'userAgent'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'SHA2-256 hash of the user-agent, used to find a matching user-agent on insert. Binary.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userAgentLookup', @level2type=N'COLUMN',@level2name=N'userAgentHash'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Dynamically updated lookup table for storing the raw user-agent strings from the browser.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userAgentLookup'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was created. Not for application use.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'createdAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was last updated. Not for application use.  Uses a trigger.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'updatedAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Only set if the device has a battery and is charging and is reported by the browser.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'batteryIsCharging'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'The current battery percentage if the device has a battery and it is reported by the browser.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'batteryLevelPercent'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'The number of seconds remaining until the battery has a full charge, if the device has a battery and is reported by the browser.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'batteryChargingTimeSecs'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'The number of seconds left on battery power until the battery is drained. Only for devices that have a battery and where it is reported by the browser.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'batteryDischargingTimeSecs'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'The number of logical processors (cpu cores) if reported by the browser.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'cpuHardwareConcurrency'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FK to the browser family lookup table' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'browserFamilyLookup_id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Browser major version as parsed from the user-agent string.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'browserMajorVersion'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Browser minor version as parsed from the user-agent string.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'browserMinorVersion'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Browser patch version as parsed from the user-agent string.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'browserPatchVersion'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FK to the operating system lookup table as parsed from the user-agent string.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'uaOperatingSystemLookup_id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Major version of the OS as parsed from the user-agent.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'uaOperatingSystemMajorVersion'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Minor version of the OS as parsed from the user-agent.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'uaOperatingSystemMinorVersion'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Patch version of the OS as parsed from the user-agent.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'uaOperatingSystemPatchVersion'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FK to the navigator platform lookup table.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'navigatorPlatformLookup_id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FK to the navigator language lookup table.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'navigatorLanguageLookup_id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Set to 1 if the browser allows cookies.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'navigatorCookieEnabled'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Download speed measured in Mb/s rounded to nearest 25 kbps. NB Chrome caps this at 10 Mbps as an anti-fingerprinting measure.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'networkConnectionDownlink'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FK to the network connection effective type lookup table.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'networkConnectionEffectiveTypeLookup_id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Network connection round trip time measured in ms.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'networkConnectionRtt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Total screen width in pixels.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'screenWidth'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Total screen height in pixels.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'screenHeight'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Width of the browser window including toolbars in pixels.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'outerWidth'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Height of the browser window including toolbars in pixels.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'outerHeight'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Width of the browser window content area in pixels.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'innerWidth'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Height of the browser window content area in pixels.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'innerHeight'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Number of bits used for colour.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'colourDepth'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FK to the device orientation lookup table.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'deviceOrientationLookup_id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Number of checks taken by the pupil app in the browser since it was last reloaded.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'appUsageCount'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FK to the user agent lookup table' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice', @level2type=N'COLUMN',@level2name=N'userAgentLookup_id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Capture browser and device properties' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userDevice'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Synthetic ID' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userInput', @level2type=N'COLUMN',@level2name=N'id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was created. Not for application use.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userInput', @level2type=N'COLUMN',@level2name=N'createdAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was last updated. Not for application use.  Uses a trigger.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userInput', @level2type=N'COLUMN',@level2name=N'updatedAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FK to the answer table - all user input is collected when the timer for a particular answer.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userInput', @level2type=N'COLUMN',@level2name=N'answer_id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Short text field.  Usually input will be a single number or a character. Some keys are stored as the english name: Enter, Delete and so on.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userInput', @level2type=N'COLUMN',@level2name=N'userInput'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FK to the userInputTypeLookup table which classifies the input as one of Mouse, Keyboard or Touch events.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userInput', @level2type=N'COLUMN',@level2name=N'userInputTypeLookup_id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'The timestamp from the pupil''s browser when the user input was entered.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userInput', @level2type=N'COLUMN',@level2name=N'browserTimestamp'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Capture user input, keystrokes, mouse and touch clicks, during the check for each question.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userInput'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Synthetic ID' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userInputTypeLookup', @level2type=N'COLUMN',@level2name=N'id'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was created. Not for application use.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userInputTypeLookup', @level2type=N'COLUMN',@level2name=N'createdAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Timestamp when the record was last updated. Not for application use.  Uses a trigger.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userInputTypeLookup', @level2type=N'COLUMN',@level2name=N'updatedAt'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Short text name for the type of user input: e.g. one of Mouse, Keyboard, Touch.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userInputTypeLookup', @level2type=N'COLUMN',@level2name=N'name'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Unique single character code for the type of user input.' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userInputTypeLookup', @level2type=N'COLUMN',@level2name=N'code'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Lookup table to store events generated in the pupil app' , @level0type=N'SCHEMA',@level0name=N'mtc_results', @level1type=N'TABLE',@level1name=N'userInputTypeLookup'
GO
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'The ident identifies a particular browser on a single machine by use of a cookie.', @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column', @level2name = 'ident'
GO
