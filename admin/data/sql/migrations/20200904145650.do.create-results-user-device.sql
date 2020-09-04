DROP TABLE IF EXISTS [mtc_results].[userDevice];

CREATE TABLE mtc_results.userDevice
([id]                                      [INT] IDENTITY ( 1, 1 ) NOT NULL,
 [createdAt]                               [DATETIMEOFFSET](3)     NOT NULL DEFAULT GETUTCDATE(),
 [updatedAt]                               [DATETIMEOFFSET](3)     NOT NULL DEFAULT GETUTCDATE(),
 [version]                                 [ROWVERSION],
 [check_id]                                INT                     NOT NULL,
 [batteryIsCharging]                       BIT,
 [batteryLevelPercent]                     TINYINT,
 [batteryChargingTimeSecs]                 INT,     -- charging time in seconds until full
 [batteryDischargingTimeSecs]              INT,     -- discharge time in seconds until empty
 [cpuHardwareConcurrency]                  TINYINT, -- number of logical processors
 [userAgentLookup_id]                      INT,
 [navigatorPlatformLookup_id]              INT,
 [navigatorLanguageLookup_id]              INT,
 [navigatorCookieEnabled]                  BIT,
 [navigatorDoNotTrack]                     BIT,
 [networkConnectionDownlink]               TINYINT, -- CHECK FLOAT download speed, Mb/s
 [networkConnectionEffectiveTypeLookup_id] INT,
 [networkConnectionRtt]                    TINYINT, -- round trip time, ms
 [screenWidth]                             INT,     -- pixels
 [screenHeight]                            INT,
 [outerWidth]                              INT,     -- width of the browser window including toolbars
 [outerHeight]                             INT,     -- height of the browser window including toolbars
 [innerWidth]                              INT,     -- width of the browser window available for content in pixels
 [innerHeight]                             INT,     -- height of the browser window available for content in pixels <https://developer.mozilla.org/en-US/docs/Web/API/Window/outerHeight>
 [colorDepth]                              TINYINT,
 [deviceOrientationLookup_id]                    INT,
 [appUsageCount]                           TINYINT, -- number of checks taken since app was initialised
 CONSTRAINT [PK_userDevice] PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT [FK_userDevice_check_id] FOREIGN KEY (check_id) REFERENCES [mtc_admin].[check] (id),
 CONSTRAINT [FK_userAgentLookup_id] FOREIGN KEY (userAgentLookup_id) REFERENCES [mtc_results].[userAgentLookup](id),
 CONSTRAINT [FK_navigatorPlatformLookup_id] FOREIGN KEY (navigatorPlatformLookup_id) REFERENCES [mtc_results].[navigatorPlatformLookup](id),
 CONSTRAINT [FK_navigatorLanguageLookup_id] FOREIGN KEY (navigatorLanguageLookup_id) REFERENCES [mtc_results].[navigatorLanguageLookup](id),
 CONSTRAINT [FK_networkConnectionEffectiveType_id] FOREIGN KEY (networkConnectionEffectiveTypeLookup_id) REFERENCES [mtc_results].[networkConnectionEffectiveTypeLookup](id),
 CONSTRAINT [FK_deviceOrientationLookup_id] FOREIGN KEY (deviceOrientationLookup_id) REFERENCES [mtc_results].[deviceOrientationLookup](id)
);