CREATE TABLE [mtc_admin].[answer]
([id]             [int] IDENTITY (1,1) NOT NULL,
 [createdAt]      [datetimeoffset](3)  NOT NULL,
 [updatedAt]      [datetimeoffset](3)  NOT NULL,
 [version]        [timestamp]          NOT NULL,
 [check_id]       [int]                NOT NULL,
 [questionNumber] [smallint]           NOT NULL,
 [answer]         [nvarchar](60)       NOT NULL,
 [isCorrect]      [bit]                NOT NULL,
 [question_id]    [int]                NOT NULL,
 CONSTRAINT [PK_answers] PRIMARY KEY CLUSTERED ([id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
)
ON [PRIMARY]
GO

/****** Object:  Index [answer_check_id_questionNumber_uindex]   ******/
CREATE UNIQUE NONCLUSTERED INDEX [answer_check_id_questionNumber_uindex] ON [mtc_admin].[answer] ([check_id] ASC, [questionNumber] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

/****** Object:  Index [ix_answer_question_id]  ******/
CREATE NONCLUSTERED INDEX [ix_answer_question_id] ON [mtc_admin].[answer] ([question_id] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO


CREATE TRIGGER [mtc_admin].[answerUpdatedAtTrigger]
    ON [mtc_admin].[answer]
    FOR UPDATE AS
BEGIN
    UPDATE [mtc_admin].[answer] SET updatedAt = GETUTCDATE() FROM inserted WHERE [answer].id = inserted.id
END
