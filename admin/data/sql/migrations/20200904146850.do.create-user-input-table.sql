DROP TABLE IF EXISTS mtc_results.userInput;

CREATE TABLE mtc_results.userInput
([id]                     INT IDENTITY ( 1, 1 ) NOT NULL,
 [createdAt]              DATETIMEOFFSET(3)     NOT NULL DEFAULT GETUTCDATE(),
 [updatedAt]              DATETIMEOFFSET(3)     NOT NULL DEFAULT GETUTCDATE(),
 [version]                ROWVERSION,
 [answer_id]              INT                   NOT NULL,
 [userInput]              NVARCHAR(10)          NOT NULL, -- 'input' clashes with a future reserved word
 [userInputTypeLookup_id] INT                   NOT NULL,
 [userInputTimestamp]     DATETIMEOFFSET(3)     NOT NULL, -- client timestamp, from the pupil's device. Not server time.
 CONSTRAINT [PK_userInput] PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT [FK_userInput_answer_id] FOREIGN KEY (answer_id) REFERENCES [mtc_results].[answer] (id),
 CONSTRAINT [FK_userInput_userInputTypeLookup_id] FOREIGN KEY (userInputTypeLookup_id) REFERENCES [mtc_results].[userInputTypeLookup] (id)
);
