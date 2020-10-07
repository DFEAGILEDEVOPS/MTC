IF ((SELECT id
       FROM mtc_results.eventTypeLookup
      WHERE eventType = 'QuestionRendered') IS NULL)
    BEGIN
        INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription)
        VALUES ('QuestionRendered',
                'The question screen was shown. For spoken questions this event is registered when the screen is showm, but the question itself is not shown until after the speech has finished.');
    END