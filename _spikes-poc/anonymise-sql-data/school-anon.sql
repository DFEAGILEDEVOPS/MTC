DECLARE @id int
DECLARE @schoolName nvarchar(128)
DECLARE @estabCode int
DECLARE schoolCursor CURSOR FAST_FORWARD FOR 
SELECT id FROM [mtc_admin].school  
OPEN schoolCursor 
FETCH NEXT  FROM schoolCursor INTO @id 
WHILE @@FETCH_STATUS = 0
BEGIN 
    BEGIN TRY
    -- set vars
        -- TODO estabCode
        SELECT @estabCode = @estabCode + 1
        SELECT @schoolName = CAST(NEWID() AS VARCHAR(255))
        UPDATE mtc_admin.school SET [name]=@schoolName WHERE id=@id
    END TRY 
   BEGIN CATCH 
      PRINT ERROR_MESSAGE()
END CATCH
FETCH NEXT FROM schoolCursor INTO @id 
END
CLOSE schoolCursor
DEALLOCATE schoolCursor