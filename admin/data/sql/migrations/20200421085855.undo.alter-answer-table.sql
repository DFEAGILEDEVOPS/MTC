IF EXISTS(SELECT *
            FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
           WHERE CONSTRAINT_COLUMN_USAGE.TABLE_SCHEMA = 'mtc_admin'
             AND CONSTRAINT_COLUMN_USAGE.TABLE_NAME = 'answer'
             AND CONSTRAINT_COLUMN_USAGE.COLUMN_NAME = 'question_id'
             AND CONSTRAINT_NAME = 'FK_answer_question_id')
    BEGIN
        ALTER TABLE [mtc_admin].[answer]
            DROP CONSTRAINT [FK_answer_question_id];
    END

IF EXISTS(
        SELECT * FROM sys.columns
         WHERE object_ID=object_id('mtc_admin.answer')
           AND col_name(object_ID,column_Id)='question_id'
    )
    BEGIN
        ALTER TABLE [mtc_admin].[answer]
            DROP COLUMN [question_id];
    END;

IF NOT EXISTS(SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('mtc_admin.answer')
                 AND col_name(object_ID, column_Id) = 'factor1')
    BEGIN
        ALTER TABLE [mtc_admin].[answer]
            ADD factor1 smallint not null;
    END


IF NOT EXISTS(SELECT *
            FROM sys.columns
           WHERE object_ID = object_id('mtc_admin.answer')
             AND col_name(object_ID, column_Id) = 'factor2')
    BEGIN
        ALTER TABLE [mtc_admin].[answer]
            ADD factor2 smallint not null;
    END

-- answer updatedAtTrigger already exists
