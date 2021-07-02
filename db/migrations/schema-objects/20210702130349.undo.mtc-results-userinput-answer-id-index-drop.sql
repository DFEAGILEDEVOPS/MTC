CREATE NONCLUSTERED INDEX [ix_temp_psreportspeedfix_20210630]
    ON [mtc_results].[userInput] ([answer_id])
    INCLUDE ([userInput],[userInputTypeLookup_id],[browserTimestamp]);
