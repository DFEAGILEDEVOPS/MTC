IF NOT EXISTS(SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.answer')
                 AND col_name(object_ID, column_Id) = 'question_id')
    BEGIN
        ALTER TABLE [mtc_admin].[answer]
            ADD [question_id] Int NOT NULL
                CONSTRAINT FK_answer_question_id FOREIGN KEY (question_id) REFERENCES [mtc_admin].[question] (id);
    END

IF EXISTS(SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.answer')
                 AND col_name(object_ID, column_Id) = 'factor1')
    BEGIN
        ALTER TABLE [mtc_admin].[answer]
            DROP COLUMN factor1;
    END

IF EXISTS(SELECT *
            FROM sys.columns
           WHERE object_ID = object_id('mtc_admin.answer')
             AND col_name(object_ID, column_Id) = 'factor2')
    BEGIN
        ALTER TABLE [mtc_admin].[answer]
            DROP COLUMN factor2;
    END
