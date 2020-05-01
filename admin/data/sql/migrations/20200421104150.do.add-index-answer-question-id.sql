DROP INDEX IF EXISTS mtc_admin.answer.ix_answer_question_id;
CREATE INDEX ix_answer_question_id ON mtc_admin.answer([question_id]);
