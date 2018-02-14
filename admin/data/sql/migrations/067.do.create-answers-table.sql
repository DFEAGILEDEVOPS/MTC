CREATE TABLE [mtc_admin].answer (
  [id]            [int] IDENTITY(1,1) NOT NULL,
  [createdAt]     [datetimeoffset](3) NOT NULL DEFAULT GETUTCDATE(),
  [updatedAt]     [datetimeoffset](3) NOT NULL DEFAULT GETUTCDATE(),
  [version]       [rowversion],
  check_id        [int] NOT NULL,
  questionNumber  [smallint] NOT NULL,
  response        nvarshar(60) NOT NULL DEFAULT '',
  factor1         [smallint] NOT NULL,
  factor2         [smallint] NOT NULL,
  isCorrect       [bit] NOT NULL,
  CONSTRAINT [PK_answers] PRIMARY KEY CLUSTERED ([id] ASC)
  WITH (
  PAD_INDEX = OFF,
    STATISTICS_NORECOMPUTE = OFF,
    IGNORE_DUP_KEY = OFF,
    ALLOW_ROW_LOCKS = ON,
    ALLOW_PAGE_LOCKS = ON
  ),
  CONSTRAINT FK_answers_check_id_check_id FOREIGN KEY (check_id) REFERENCES [mtc_admin].[check](id)
);

CREATE UNIQUE INDEX answer_check_id_questionNumber_uindex on [mtc_admin].answer (check_id, questionNumber);
