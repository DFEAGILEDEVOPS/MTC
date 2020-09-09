DROP TABLE IF EXISTS mtc_results.userInput;

CREATE TABLE mtc_results.userInput
([id]                     INT IDENTITY ( 1, 1 ) NOT NULL,
 [createdAt]              DATETIMEOFFSET(3)     NOT NULL DEFAULT GETUTCDATE(),
 [updatedAt]              DATETIMEOFFSET(3)     NOT NULL DEFAULT GETUTCDATE(),
 [version]                ROWVERSION,
 [check_id]               INT                   NOT NULL,
 [question_id]            INT                   NOT NULL,
 [questionNumber]         INT                   NOT NULL,
 [userInput]              NVARCHAR(10)          NOT NULL, -- 'input' clashes with a future reserved word
 [userInputTypeLookup_id] INT                   NOT NULL,
 [userInputTimestamp]     DATETIMEOFFSET(3)     NOT NULL, -- client timestamp, from the pupil's device. Not server time.
 CONSTRAINT [PK_userInput] PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
 CONSTRAINT [FK_userInput_check_id] FOREIGN KEY (check_id) REFERENCES [mtc_admin].[check] (id),
 CONSTRAINT [FK_userInput_question_id] FOREIGN KEY (question_id) REFERENCES [mtc_admin].[question] (id),
 CONSTRAINT [FK_userInput_userInputType_id] FOREIGN KEY (userInputTypeLookup_id) REFERENCES [mtc_results].[userInputTypeLookup] (id)
);
