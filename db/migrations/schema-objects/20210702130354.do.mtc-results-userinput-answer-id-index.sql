CREATE NONCLUSTERED INDEX [ix_userInput_answer_id]
ON [mtc_results].[userInput] ([answer_id])
INCLUDE ([userInput],[userInputTypeLookup_id],[browserTimestamp]);
