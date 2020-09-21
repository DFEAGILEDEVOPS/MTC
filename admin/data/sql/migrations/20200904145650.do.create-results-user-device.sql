DROP TABLE IF EXISTS mtc_results.userDevice;

CREATE TABLE mtc_results.userDevice
([id]                                      INT IDENTITY ( 1, 1 ) NOT NULL,
 [createdAt]                               DATETIMEOFFSET(3)     NOT NULL DEFAULT GETUTCDATE(),
 [updatedAt]                               DATETIMEOFFSET(3)     NOT NULL DEFAULT GETUTCDATE(),
 [version]                                 ROWVERSION,
 [batteryIsCharging]                       BIT,
 [batteryLevelPercent]                     TINYINT,
 [batteryChargingTimeSecs]                 INT,     -- charging time in seconds until full
 [batteryDischargingTimeSecs]              INT,     -- discharge time in seconds until empty
 [cpuHardwareConcurrency]                  TINYINT, -- number of logical processors
 [browserFamilyLookup_id]                  INT,     -- reference to the browser family: Opera, Safari, Chrome, ...
 [browserMajorVersion]                     INT,
 [browserMinorVersion]                     INT,
 [browserPatchVersion]                     INT,
 [uaOperatingSystemLookup_id]              INT,     -- Lookup up the OS name, e.g. WINDOWS, OSX, IOS, LINUX,
 [uaOperatingSystemMajorVersion]           INT,     -- Operating system version as determined from parsing the User Agent String provided by the browser
 [uaOperatingSystemMinorVersion]           INT,     -- Operating system version as determined from parsing the User Agent String provided by the browser
 [uaOperatingSystemPatchVersion]           INT,     -- Operating system version as determined from parsing the User Agent String provided by the browser
 [navigatorPlatformLookup_id]              INT,
 [navigatorLanguageLookup_id]              INT,
 [navigatorCookieEnabled]                  BIT,
 [networkConnectionDownlink]               FLOAT,   -- Download speed, Mb/s rounded to nearest 25 kbps. NB Chrome caps this at 10 Mbps as an anti-fingerprinting measure
 [networkConnectionEffectiveTypeLookup_id] INT,
 [networkConnectionRtt]                    TINYINT, -- round trip time, ms
 [screenWidth]                             INT,     -- pixels
 [screenHeight]                            INT,
 [outerWidth]                              INT,     -- width of the browser window including toolbars
 [outerHeight]                             INT,     -- height of the browser window including toolbars
 [innerWidth]                              INT,     -- width of the browser window available for content in pixels
 [innerHeight]                             INT,     -- height of the browser window available for content in pixels <https://developer.mozilla.org/en-US/docs/Web/API/Window/outerHeight>
 [colourDepth]                             TINYINT,
 [deviceOrientationLookup_id]              INT,
 [appUsageCount]                           TINYINT, -- number of checks taken since app was initialised
 [userAgentLookup_id]                      INT,
 CONSTRAINT [PK_userDevice] PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT [FK_userAgentLookup_id] FOREIGN KEY (userAgentLookup_id) REFERENCES [mtc_results].[userAgentLookup] (id),
 CONSTRAINT [FK_browserFamilyLookup_id] FOREIGN KEY (browserFamilyLookup_id) REFERENCES [mtc_results].[browserFamilyLookup] (id),
 CONSTRAINT [FK_navigatorPlatformLookup_id] FOREIGN KEY (navigatorPlatformLookup_id) REFERENCES [mtc_results].[navigatorPlatformLookup] (id),
 CONSTRAINT [FK_navigatorLanguageLookup_id] FOREIGN KEY (navigatorLanguageLookup_id) REFERENCES [mtc_results].[navigatorLanguageLookup] (id),
 CONSTRAINT [FK_networkConnectionEffectiveTypeLookup_id] FOREIGN KEY (networkConnectionEffectiveTypeLookup_id) REFERENCES [mtc_results].[networkConnectionEffectiveTypeLookup] (id),
 CONSTRAINT [FK_deviceOrientationLookup_id] FOREIGN KEY (deviceOrientationLookup_id) REFERENCES [mtc_results].[deviceOrientationLookup] (id),
 CONSTRAINT [FK_uaOperatingSystemLookup_id] FOREIGN KEY (uaOperatingSystemLookup_id) REFERENCES [mtc_results].[uaOperatingSystemLookup] (id)
);

CREATE INDEX userDevice_useragentLookup_id ON mtc_results.userDevice (useragentLookup_id);
CREATE INDEX userDevice_browserFamilyLookup_id ON mtc_results.userDevice (browserFamilyLookup_id);
CREATE INDEX userDevice_navigatorPlatformLookup_id ON mtc_results.userDevice (navigatorPlatformLookup_id);
CREATE INDEX userDevice_navigatorLanguageLookup_id ON mtc_results.userDevice (navigatorLanguageLookup_id);
CREATE INDEX userDevice_networkConnectionEffectiveType_id ON mtc_results.userDevice (networkConnectionEffectiveTypeLookup_id);
CREATE INDEX userDevice_deviceOrientationLookup_id ON mtc_results.userDevice (deviceOrientationLookup_id);
CREATE INDEX userDevice_uaOperatingSystemLookup_id ON mtc_results.userDevice (uaOperatingSystemLookup_id);
