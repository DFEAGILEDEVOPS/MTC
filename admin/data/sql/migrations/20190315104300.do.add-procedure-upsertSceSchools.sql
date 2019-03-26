CREATE PROCEDURE [mtc_admin].[spUpsertSceSchools]
    @sceSchools [mtc_admin].[SceTableType] READONLY
AS
    IF @@TRANCOUNT <> 0
        ROLLBACK TRANSACTION

    BEGIN TRY
    BEGIN TRANSACTION

    MERGE INTO
        mtc_admin.sce AS Target
    USING
        @sceSchools AS Source
    ON Target.school_id = Source.school_id
    WHEN MATCHED THEN
        UPDATE SET Target.timezone = Source.timezone
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (school_id, timezone, isOpen) VALUES (Source.school_id, Source.timezone, Source.isOpen)
    WHEN NOT MATCHED BY SOURCE THEN
        DELETE;

    COMMIT TRANSACTION

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

        SELECT  @ErrorMessage = ERROR_MESSAGE(),
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
