CREATE TABLE [mtc_admin].[emergencyOffSwitch] (
  [id] TINYINT NOT NULL,
  [isEnabled] BIT NOT NULL CONSTRAINT [DF_emergencyOffSwitch_isEnabled] DEFAULT (0),
  [updatedAt] DATETIMEOFFSET(3) NOT NULL CONSTRAINT [DF_emergencyOffSwitch_updatedAt] DEFAULT (SYSUTCDATETIME()),
  [updatedBy_userId] INT NULL,
  CONSTRAINT [PK_emergencyOffSwitch] PRIMARY KEY ([id]),
  CONSTRAINT [CK_emergencyOffSwitch_singleton] CHECK ([id] = 1),
  CONSTRAINT [FK_emergencyOffSwitch_updatedBy_userId] FOREIGN KEY ([updatedBy_userId]) REFERENCES [mtc_admin].[user] ([id])
);

INSERT INTO [mtc_admin].[emergencyOffSwitch] ([id], [isEnabled])
VALUES (1, 0);

CREATE TABLE [mtc_admin].[emergencyOffSwitchLog] (
  [id] INT IDENTITY(1, 1) NOT NULL,
  [isEnabled] BIT NOT NULL,
  [changedAt] DATETIMEOFFSET(3) NOT NULL CONSTRAINT [DF_emergencyOffSwitchLog_changedAt] DEFAULT (SYSUTCDATETIME()),
  [changedBy_userId] INT NOT NULL,
  CONSTRAINT [PK_emergencyOffSwitchLog] PRIMARY KEY ([id]),
  CONSTRAINT [FK_emergencyOffSwitchLog_changedBy_userId] FOREIGN KEY ([changedBy_userId]) REFERENCES [mtc_admin].[user] ([id])
);
