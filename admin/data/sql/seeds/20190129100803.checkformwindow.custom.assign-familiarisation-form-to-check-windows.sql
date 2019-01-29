DECLARE @CheckWindowCursor CURSOR;
DECLARE @checkWindowId INT;
BEGIN
   SET @CheckWindowCursor = CURSOR FOR
    -- FETCH ALL CURRENT OR FUTURE CHECK WINDOWS
    SELECT cw.id from [mtc_admin].checkWindow cw
    WHERE GETUTCDATE() < checkEndDate
    EXCEPT
    -- EXCEPT THE ONES WHICH ALREADY HAVE MTC0103 FORM ASSIGNED
    SELECT cw.id from [mtc_admin].checkWindow cw
    LEFT JOIN [mtc_admin].checkFormWindow cfw
      ON cw.id = cfw.checkWindow_id
    lEFT JOIN [mtc_admin].checkForm cf
      ON cf.id = cfw.checkForm_id
    WHERE (cf.name = 'MTC0103')

   OPEN @CheckWindowCursor
   FETCH NEXT FROM @CheckWindowCursor
   INTO @checkWindowId

   WHILE @@FETCH_STATUS = 0
   BEGIN
     INSERT INTO [mtc_admin].[checkFormWindow] (checkForm_id, checkWindow_id)
     VALUES (
       (SELECT id FROM [mtc_admin].[checkForm] WHERE name = 'MTC0103'),
       (@checkWindowId)
     )
     FETCH NEXT FROM @CheckWindowCursor
     INTO @checkWindowId
   END;
   CLOSE @CheckWindowCursor;
   DEALLOCATE @CheckWindowCursor;
END;
