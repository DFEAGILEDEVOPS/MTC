ALTER TABLE [mtc_admin].[pupilAgeReason]
            ADD [createdAt] DATETIMEOFFSET(7) NOT NULL DEFAULT (GETUTCDATE()),
                [updatedAt] DATETIMEOFFSET(7) NOT NULL DEFAULT (GETUTCDATE());
