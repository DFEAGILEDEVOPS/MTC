-- create the create checks stored procedure
DROP PROCEDURE IF EXISTS [mtc_admin].[spCreateChecks];
GO
CREATE PROCEDURE [mtc_admin].[spCreateChecks]
    @TVP [mtc_admin].[CheckTableType] READONLY
AS

  -- Connection pooling is enabled - make sure we are not in an existing transaction
  IF @@TRANCOUNT <> 0  -- Rollback old transactions before starting another
    ROLLBACK TRANSACTION

  BEGIN TRY
  BEGIN TRANSACTION

  DECLARE checkArgsList CURSOR
  FOR SELECT pupil_id, checkForm_id, checkWindow_id, isLiveCheck, pinExpiresAt, school_id
      FROM @TVP
    FOR READ ONLY

  DECLARE @pupilId int
  DECLARE @checkFormId int
  DECLARE @checkWindowId int
  DECLARE @isLiveCheck bit
  DECLARE @pinExpiresAt datetimeoffset
  DECLARE @schoolId int
  DECLARE @pin int
  DECLARE @err int
  DEClARE @checkId int
  DECLARE @output TABLE (id int);

  OPEN checkArgsList
  FETCH checkArgsList INTO @pupilId, @checkFormId, @checkWindowId, @isLiveCheck, @pinExpiresAt, @schoolId
  WHILE (@@FETCH_STATUS = 0) BEGIN

    -- Create the check
    INSERT INTO [mtc_admin].[check]
        (pupil_id, checkForm_id, checkWindow_id, isLiveCheck)
    VALUES (@pupilId, @checkFormId, @checkWindowId, @isLiveCheck);

    -- Get the check.id we just inserted
    SET @checkId = SCOPE_IDENTITY();

    -- Assign a pin to the check
    INSERT INTO [mtc_admin].[checkPin] (school_id, check_id, pinExpiresAt, pin_id)
    VALUES (@schoolId, @checkId, @pinExpiresAt, (SELECT TOP 1 p.id
                                                 FROM [mtc_admin].[pin] p
                                                        LEFT JOIN [mtc_admin].[checkPin] cp ON (p.id = cp.pin_id)
                                                 WHERE (cp.pin_id IS NULL OR
                                                        (cp.school_id <> @schoolId AND cp.pin_id IS NOT NULL))
                                                 ORDER BY NEWID()));

    -- Store the check.id in the output table
    INSERT INTO @output (id) (SELECT @checkId);

    FETCH checkArgsList INTO @pupilId, @checkFormId, @checkWindowId, @isLiveCheck, @pinExpiresAt, @schoolId
  END

  COMMIT TRANSACTION

  -- OUTPUT newly created check IDs to the caller
  SELECT * from @output;

  CLOSE checkArgsList
  DEALLOCATE checkArgsList

  END TRY
  BEGIN CATCH
      IF (@@TRANCOUNT > 0)
        BEGIN
          ROLLBACK TRANSACTION
          PRINT 'Error detected, all changes reversed'
        END
      DECLARE @ErrorMessage NVARCHAR(4000);
      DECLARE @ErrorSeverity INT;
      DECLARE @ErrorState INT;

      SELECT @ErrorMessage = ERROR_MESSAGE(),
             @ErrorSeverity = ERROR_SEVERITY(),
             @ErrorState = ERROR_STATE();

      -- Use RAISERROR inside the CATCH block to return
      -- error information about the original error that
      -- caused execution to jump to the CATCH block.
      RAISERROR (@ErrorMessage, -- Message text.
        @ErrorSeverity, -- Severity.
        @ErrorState -- State.
      );
  END CATCH

  GO
