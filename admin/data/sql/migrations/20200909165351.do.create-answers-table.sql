DROP TABLE IF EXISTS mtc_results.answer;

CREATE TABLE [mtc_results].answer
(id             INT IDENTITY (1,1) NOT NULL,
 createdAt      DATETIMEOFFSET(3)  NOT NULL DEFAULT GETUTCDATE(),
 updatedAt      DATETIMEOFFSET(3)  NOT NULL DEFAULT GETUTCDATE(),
 version        ROWVERSION,
 checkResult_id INT                NOT NULL,
 questionNumber SMALLINT           NOT NULL,
 answer         NVARCHAR(60)       NOT NULL DEFAULT '',
 question_id    INT                NOT NULL,
 isCorrect      BIT                NOT NULL,
 CONSTRAINT PK_answer PRIMARY KEY CLUSTERED ([id] ASC) WITH ( PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON ),
 CONSTRAINT FK_answer_checkResult_id_checkResult_id FOREIGN KEY (checkResult_id) REFERENCES [mtc_results].[checkResult] (id),
 CONSTRAINT FK_answer_question_id FOREIGN KEY (question_id) REFERENCES [mtc_admin].[question] (id),
 CONSTRAINT answer_checkResult_id_questionNumber_uindex UNIQUE (checkResult_id, questionNumber)
);

CREATE INDEX ix_answer_question_id ON mtc_results.answer (question_id);
CREATE INDEX ix_answer_checkResult_id ON mtc_results.answer (checkResult_id);
