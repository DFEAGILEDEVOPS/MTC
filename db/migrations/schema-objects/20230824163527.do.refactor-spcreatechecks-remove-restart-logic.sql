
ALTER PROCEDURE [mtc_admin].[spCreateChecks]
@TVP [mtc_admin].[CheckTableType] READONLY
AS
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
SET CONCAT_NULL_YIELDS_NULL ON
SET ANSI_WARNINGS ON
SET ANSI_PADDING ON

-- only proceed if school has an active pin
DECLARE @school_id int
SELECT TOP 1 @school_id = school_id FROM @TVP
IF NOT EXISTS (SELECT id FROM mtc_admin.school
    WHERE (id = @school_id AND pin IS NOT NULL
    AND (pinExpiresAt IS NOT NULL AND pinExpiresAt > GETUTCDATE())))
    RAISERROR ('50001: School has no valid pin', 18, 1)

-- Connection pooling is enabled - make sure we are not in an existing transaction
IF @@TRANCOUNT <> 0  -- Rollback old transactions before starting another
    ROLLBACK TRANSACTION

BEGIN TRY
    BEGIN TRANSACTION

        DECLARE checkArgsList CURSOR
            FOR SELECT pupil_id, checkForm_id, checkWindow_id, isLiveCheck, pinExpiresAt, school_id, createdBy_userId
                FROM @TVP
            FOR READ ONLY

        DECLARE @pupilId int
        DECLARE @checkFormId int
        DECLARE @checkWindowId int
        DECLARE @isLiveCheck bit
        DECLARE @pinExpiresAt datetimeoffset
        DECLARE @schoolId int
        DECLARE @createdBy_userId int
        DEClARE @checkId int
        DECLARE @output TABLE (id int);
        DECLARE @isRestart bit;
        DECLARE @pupilRestartId int;

        OPEN checkArgsList
        FETCH checkArgsList INTO @pupilId, @checkFormId, @checkWindowId, @isLiveCheck, @pinExpiresAt, @schoolId, @createdBy_userId
        WHILE (@@FETCH_STATUS = 0) BEGIN

            -- Create the check
            INSERT INTO [mtc_admin].[check]
            (pupil_id, checkForm_id, checkWindow_id, isLiveCheck, createdBy_userId)
            VALUES (@pupilId, @checkFormId, @checkWindowId, @isLiveCheck, @createdBy_userId);

            -- Get the check.id we just inserted
            SET @checkId = SCOPE_IDENTITY();

            -- Assign a pin to the check
            INSERT INTO [mtc_admin].[checkPin] (school_id, check_id, pinExpiresAt, pin_id)
            VALUES (
                @schoolId,
                @checkId,
                @pinExpiresAt,
                (SELECT TOP 1 id
                   FROM (SELECT id
                           FROM mtc_admin.pin EXCEPT
                         SELECT pin_id
                           FROM mtc_admin.checkPin
                          WHERE school_id = @schoolId) as vew
                  ORDER BY NEWID())
            );


            IF @isLiveCheck = 1
                BEGIN
                    -- Update the pupil state
                    UPDATE [mtc_admin].[pupil]
                    SET currentCheckId = @checkId,
                        checkComplete = 0,
                        restartAvailable = 0
                    WHERE id = @pupilId;
                END

            -- Store the check.id in the output table
            INSERT INTO @output (id) (SELECT @checkId);

            FETCH checkArgsList INTO @pupilId, @checkFormId, @checkWindowId, @isLiveCheck, @pinExpiresAt, @schoolId, @createdBy_userId
        END

    COMMIT TRANSACTION

    -- OUTPUT newly created checks to the caller
    SELECT
      chk.id as check_id,
      chk.checkCode as check_checkCode,
      chk.isLiveCheck as check_isLiveCheck,
      chk.createdBy_userId as check_createdBy_userId,
      pin.val as pupil_pin,
      cp.pinExpiresAt as pupil_pinExpiresAt,
      pupil.id as pupil_id,
      pupil.foreName as pupil_foreName,
      pupil.lastName as pupil_lastName,
      pupil.foreNameAlias as pupil_foreNameAlias,
      pupil.lastNameAlias as pupil_lastNameAlias,
      pupil.dateOfBirth as pupil_dateOfBirth,
      pupil.urlSlug as pupil_uuid,
      pupil.jwtToken as pupil_jwtToken,
      checkForm.id as checkForm_id,
      checkForm.formData as checkForm_formData,
      school.id as school_id,
      school.urlSlug as school_uuid,
      school.name as school_name,
      school.pin as school_pin,
      school.pinExpiresAt as school_pinExpiresAt,
      ISNULL(sce.timezone, 'Europe/London') as timezone
    FROM
      [mtc_admin].[check] chk
      INNER JOIN [mtc_admin].[pupil] pupil ON (chk.pupil_id = pupil.id)
      INNER JOIN [mtc_admin].[checkForm] checkForm ON (chk.checkForm_id = checkForm.id)
      INNER JOIN [mtc_admin].[school] school on (pupil.school_id = school.id)
      INNER JOIN [mtc_admin].[checkPin] cp on (chk.id = cp.check_id)
      INNER JOIN [mtc_admin].[pin] pin ON (cp.pin_id = pin.id)
      LEFT JOIN [mtc_admin].sce ON (sce.school_id = school.id)
    WHERE chk.id IN (SELECT id from @output);

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
