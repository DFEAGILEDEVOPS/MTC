--  Document browserFamily table
--
EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = N'Dynamically updated lookup table for web browser names', @level0type = N'SCHEMA',
     @level0name = 'mtc_results', @level1type = N'TABLE', @level1name = 'browserFamilyLookup';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Synthetic ID', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'browserFamilyLookup', @level2type = N'Column',
     @level2name = 'id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was created. Not for application use.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'browserFamilyLookup', @level2type = N'Column',
     @level2name = 'createdAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was last updated. Not for application use.  Uses a trigger.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'browserFamilyLookup',
     @level2type = N'Column', @level2name = 'updatedAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'The name of the browser used to take the check',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'browserFamilyLookup',
     @level2type = N'Column', @level2name = 'family';


-- Document deviceOrientationLookup table
--
EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = N'Dynamically updated lookup table for device screen orientations, e.g. portrait or landscape',
     @level0type = N'SCHEMA', @level0name = 'mtc_results', @level1type = N'TABLE',
     @level1name = 'deviceOrientationLookup';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Synthetic ID', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'deviceOrientationLookup',
     @level2type = N'Column', @level2name = 'id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was created. Not for application use.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'deviceOrientationLookup',
     @level2type = N'Column', @level2name = 'createdAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was last updated. Not for application use.  Uses a trigger.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table',
     @level1name = 'deviceOrientationLookup', @level2type = N'Column', @level2name = 'updatedAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'The orientation of the screen used to take the check as obtained from the browser if supported.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table',
     @level1name = 'deviceOrientationLookup', @level2type = N'Column', @level2name = 'orientation';

-- Document navigatorLanguageLookup table
--
EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = N'Dynamically updated lookup table for storing the web browser''s language setting',
     @level0type = N'SCHEMA', @level0name = 'mtc_results', @level1type = N'TABLE',
     @level1name = 'navigatorLanguageLookup';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Synthetic ID', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'navigatorLanguageLookup',
     @level2type = N'Column', @level2name = 'id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was created. Not for application use.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'navigatorLanguageLookup',
     @level2type = N'Column', @level2name = 'createdAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was last updated. Not for application use.  Uses a trigger.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table',
     @level1name = 'navigatorLanguageLookup', @level2type = N'Column', @level2name = 'updatedAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Language setting exactly as reported by the web browser', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'navigatorLanguageLookup',
     @level2type = N'Column', @level2name = 'platformLang';

-- Document navigatorPlatformLookup table
--
EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = N'Dynamically updated lookup table for storing the web browser''s platform setting',
     @level0type = N'SCHEMA', @level0name = 'mtc_results', @level1type = N'TABLE',
     @level1name = 'navigatorPlatformLookup';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Synthetic ID', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'navigatorPlatformLookup',
     @level2type = N'Column', @level2name = 'id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was created. Not for application use.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'navigatorPlatformLookup',
     @level2type = N'Column', @level2name = 'createdAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was last updated. Not for application use.  Uses a trigger.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table',
     @level1name = 'navigatorPlatformLookup', @level2type = N'Column', @level2name = 'updatedAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Platform setting as reported by the web browser. e.g. WIN32', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'navigatorPlatformLookup',
     @level2type = N'Column', @level2name = 'platform';


-- Document networkConnectionEffectiveTypeLookup table
--
EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = N'Dynamically updated lookup table for storing the web browser''s network type setting - API: navigator.connection.effectiveType which gives network speed class experienced by the device. E.g. 2g, 3g, 4g',
     @level0type = N'SCHEMA', @level0name = 'mtc_results', @level1type = N'TABLE',
     @level1name = 'networkConnectionEffectiveTypeLookup';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Synthetic ID', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'networkConnectionEffectiveTypeLookup',
     @level2type = N'Column', @level2name = 'id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was created. Not for application use.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'networkConnectionEffectiveTypeLookup',
     @level2type = N'Column', @level2name = 'createdAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was last updated. Not for application use.  Uses a trigger.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table',
     @level1name = 'networkConnectionEffectiveTypeLookup', @level2type = N'Column', @level2name = 'updatedAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Actual network speed classification as reported by the web browser. e.g. 4g', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'networkConnectionEffectiveTypeLookup',
     @level2type = N'Column', @level2name = 'effectiveType';


-- Document uaOperatingSystemLookup table
--
EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = N'Dynamically updated lookup table for storing the Operating System as determined by parsing the user-agent field reported by the browser.  May not be accurate in all cases.  User-agents may be spoofed.',
     @level0type = N'SCHEMA', @level0name = 'mtc_results', @level1type = N'TABLE',
     @level1name = 'uaOperatingSystemLookup';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Synthetic ID', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'uaOperatingSystemLookup',
     @level2type = N'Column', @level2name = 'id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was created. Not for application use.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'uaOperatingSystemLookup',
     @level2type = N'Column', @level2name = 'createdAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was last updated. Not for application use.  Uses a trigger.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table',
     @level1name = 'uaOperatingSystemLookup', @level2type = N'Column', @level2name = 'updatedAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Operating sytem name as determined by parsing the user-agent string and converted to uppercase, e.g. WINDOWS',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table',
     @level1name = 'uaOperatingSystemLookup', @level2type = N'Column', @level2name = 'os';


-- Document userAgentLookup table
--
EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = N'Dynamically updated lookup table for storing the raw user-agent strings from the browser.',
     @level0type = N'SCHEMA', @level0name = 'mtc_results', @level1type = N'TABLE', @level1name = 'userAgentLookup';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Synthetic ID', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userAgentLookup', @level2type = N'Column',
     @level2name = 'id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was created. Not for application use.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userAgentLookup', @level2type = N'Column',
     @level2name = 'createdAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was last updated. Not for application use.  Uses a trigger.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userAgentLookup',
     @level2type = N'Column', @level2name = 'updatedAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Raw user-agent as reported by the browser.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userAgentLookup',
     @level2type = N'Column', @level2name = 'userAgent';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'SHA2-256 hash of the user-agent, used to find a matching user-agent on insert. Binary.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userAgentLookup',
     @level2type = N'Column', @level2name = 'userAgentHash';


-- Document userDevice table
--
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'Capture browser and device properties',
     @level0type = N'SCHEMA', @level0name = 'mtc_results', @level1type = N'TABLE', @level1name = 'userDevice';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was created. Not for application use.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'createdAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was last updated. Not for application use.  Uses a trigger.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice',
     @level2type = N'Column', @level2name = 'updatedAt';

-- EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'FK to mtc_admin.check.id', @level0type = N'Schema',
--      @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
--      @level2name = 'check_id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Only set if the device has a battery and is charging and is reported by the browser.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice',
     @level2type = N'Column', @level2name = 'batteryIsCharging';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'The current battery percentage if the device has a battery and it is reported by the browser.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice',
     @level2type = N'Column', @level2name = 'batteryLevelPercent';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'The number of seconds remaining until the battery has a full charge, if the device has a battery and is reported by the browser.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice',
     @level2type = N'Column', @level2name = 'batteryChargingTimeSecs';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'The number of seconds left on battery power until the battery is drained. Only for devices that have a battery and where it is reported by the browser.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice',
     @level2type = N'Column', @level2name = 'batteryDischargingTimeSecs';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'The number of logical processors (cpu cores) if reported by the browser.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'cpuHardwareConcurrency';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'FK to the user agent lookup table',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice',
     @level2type = N'Column', @level2name = 'userAgentLookup_id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'FK to the browser family lookup table',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice',
     @level2type = N'Column', @level2name = 'browserFamilyLookup_id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Browser major version as parsed from the user-agent string.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'browserMajorVersion';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Browser minor version as parsed from the user-agent string.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'browserMinorVersion';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Browser patch version as parsed from the user-agent string.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'BrowserPatchVersion';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'FK to the operating system lookup table as parsed from the user-agent string.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'uaOperatingSystemLookup_id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Major version of the OS as parsed from the user-agent.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'uaOperatingSystemMajorVersion';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Minor version of the OS as parsed from the user-agent.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'uaOperatingSystemMinorVersion';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Patch version of the OS as parsed from the user-agent.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'uaOperatingSystemPatchVersion';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'FK to the navigator platform lookup table.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice',
     @level2type = N'Column', @level2name = 'navigatorPlatformLookup_id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'FK to the navigator language lookup table.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice',
     @level2type = N'Column', @level2name = 'navigatorLanguageLookup_id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Set to 1 if the browser allows cookies.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice',
     @level2type = N'Column', @level2name = 'navigatorCookieEnabled';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Download speed measured in Mb/s rounded to nearest 25 kbps. NB Chrome caps this at 10 Mbps as an anti-fingerprinting measure.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice',
     @level2type = N'Column', @level2name = 'networkConnectionDownlink';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'FK to the network connection effective type lookup table.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'networkConnectionEffectiveTypeLookup_id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Network connection round trip time measured in ms.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'networkConnectionRtt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Total screen width in pixels.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice',
     @level2type = N'Column', @level2name = 'screenWidth';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Total screen height in pixels.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice',
     @level2type = N'Column', @level2name = 'screenHeight';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Width of the browser window including toolbars in pixels.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'outerWidth';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Height of the browser window including toolbars in pixels.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'outerHeight';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Width of the browser window content area in pixels.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'innerWidth';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Height of the browser window content area in pixels.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'innerHeight';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Number of bits used for colour.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'colourDepth';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'FK to the device orientation lookup table.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'deviceOrientationLookup_id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Number of checks taken by the pupil app in the browser since it was last reloaded.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userDevice', @level2type = N'Column',
     @level2name = 'appUsageCount';


-- Document userInput table
--
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'Capture user input, keystrokes, mouse and touch clicks, during the check for each question.',
     @level0type = N'SCHEMA', @level0name = 'mtc_results', @level1type = N'TABLE', @level1name = 'userInput';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Synthetic ID', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userInput', @level2type = N'Column',
     @level2name = 'id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was created. Not for application use.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userInput', @level2type = N'Column',
     @level2name = 'createdAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was last updated. Not for application use.  Uses a trigger.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userInput',
     @level2type = N'Column', @level2name = 'updatedAt';

-- EXEC sys.sp_addextendedproperty @name = N'MS_Description',
--      @value = 'FK to mtc_admin.check table',
--      @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userInput',
--      @level2type = N'Column', @level2name = 'check_id';

-- EXEC sys.sp_addextendedproperty @name = N'MS_Description',
--      @value = 'FK to the mtc_admin.question table.  Provides the two factors in the multiplication.',
--      @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userInput',
--      @level2type = N'Column', @level2name = 'question_id';

-- EXEC sys.sp_addextendedproperty @name = N'MS_Description',
--      @value = 'The sequence in the form that the question appeared.  E.g. 1st of 25 questions.',
--      @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userInput',
--      @level2type = N'Column', @level2name = 'questionNumber';

-- EXEC sys.sp_addextendedproperty @name = N'MS_Description',
--      @value = 'A single input the user entered when answering this question. Some keys are spelled out, e.g. "Enter" for key of the same name.',
--      @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userInput',
--      @level2type = N'Column', @level2name = 'userInput';
--
-- EXEC sys.sp_addextendedproperty @name = N'MS_Description',
--      @value = 'FK to the user input type table.',
--      @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'userInput',
--      @level2type = N'Column', @level2name = 'userInputType_id';

-- Document answer table
--
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'Capture user answers for the check',
     @level0type = N'SCHEMA', @level0name = 'mtc_results', @level1type = N'TABLE', @level1name = 'answer';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Synthetic ID', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'answer', @level2type = N'Column',
     @level2name = 'id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was created. Not for application use.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'answer', @level2type = N'Column',
     @level2name = 'createdAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was last updated. Not for application use.  Uses a trigger.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'answer',
     @level2type = N'Column', @level2name = 'updatedAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'FK to checkResult table.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'answer',
     @level2type = N'Column', @level2name = 'checkResult_id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'The sequence in the form that the question appeared.  E.g. 1st of 25 questions.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'answer',
     @level2type = N'Column', @level2name = 'questionNumber';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'The response from the pupil as an answer to a question.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'answer',
     @level2type = N'Column', @level2name = 'answer';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'FK to the question table detailing the question that was asked.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'answer',
     @level2type = N'Column', @level2name = 'question_id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Set to true if the answer to the question is correct.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'answer',
     @level2type = N'Column', @level2name = 'isCorrect';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'The timestamp the answer was provided, either because the pupil hit enter, or ran out of time.  This data is sourced from the pupils computer.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'answer',
     @level2type = N'Column', @level2name = 'browserTimestamp';

-- Document checkResult table
--
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'Store the check results once the pupil has taken the check.',
     @level0type = N'SCHEMA', @level0name = 'mtc_results', @level1type = N'TABLE', @level1name = 'checkResult';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Synthetic ID', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'checkResult', @level2type = N'Column',
     @level2name = 'id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was created. Not for application use.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'checkResult', @level2type = N'Column',
     @level2name = 'createdAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was last updated. Not for application use.  Uses a trigger.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'checkResult',
     @level2type = N'Column', @level2name = 'updatedAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'FK to the check table.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'checkResult',
     @level2type = N'Column', @level2name = 'check_id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'The marks awarded for the check.  For MTC this equals the number of correctly answered questions.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'checkResult',
     @level2type = N'Column', @level2name = 'mark';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'The server timestamp when the marking was applied.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'checkResult',
     @level2type = N'Column', @level2name = 'markedAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'FK to the userDevice table.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'checkResult',
     @level2type = N'Column', @level2name = 'userDevice_id';

-- Document event table
--
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'Store the check results once the pupil has taken the check.',
     @level0type = N'SCHEMA', @level0name = 'mtc_results', @level1type = N'TABLE', @level1name = 'event';

EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'Synthetic ID', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'event', @level2type = N'Column',
     @level2name = 'id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was created. Not for application use.', @level0type = N'Schema',
     @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'event', @level2type = N'Column',
     @level2name = 'createdAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'Timestamp when the record was last updated. Not for application use.  Uses a trigger.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'event',
     @level2type = N'Column', @level2name = 'updatedAt';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'FK to the checkResult table.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'event',
     @level2type = N'Column', @level2name = 'checkResult_id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'FK to the event type lookup.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'event',
     @level2type = N'Column', @level2name = 'eventTypeLookup_id';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'The timestamp the event was triggered.  This data is sourced from the pupils computer.',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'event',
     @level2type = N'Column', @level2name = 'browserTimestamp';

EXEC sys.sp_addextendedproperty @name = N'MS_Description',
     @value = 'JSON event-specific data',
     @level0type = N'Schema', @level0name = 'mtc_results', @level1type = N'Table', @level1name = 'event',
     @level2type = N'Column', @level2name = 'eventData';

