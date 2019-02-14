DROP TABLE IF EXISTS [mtc_admin].[schoolPin];
CREATE TABLE [mtc_admin].[schoolPin]
  (
    [id]        [int] IDENTITY (1,1) NOT NULL,
    [createdAt] [datetimeoffset](3)  NOT NULL DEFAULT GETUTCDATE(),
    [updatedAt] [datetimeoffset](3)  NOT NULL DEFAULT GETUTCDATE(),
    [version]   [rowversion],
    [schoolPin] [nvarchar](12)       NULL,
    [school_id] [int]                NULL,
    CONSTRAINT [PK_schoolPin] PRIMARY KEY CLUSTERED ([id] ASC)
      WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
    CONSTRAINT [IX_schoolPin_schoolPin_unique] UNIQUE (schoolPin),
    CONSTRAINT [FK_schoolPin_school_id_school_id] FOREIGN KEY (school_id) REFERENCES [mtc_admin].[school](id)
  );
GO

--
-- Add a unique index on the schoolPin.school_id field to ensure a school can only get
-- one pin at a time.
--
CREATE UNIQUE INDEX [IX_schoolPin_school_id_unique]
ON [mtc_admin].[schoolPin](school_id)
WHERE school_id IS NOT NULL;
GO

--
-- Tidy up the old school stuff
--
DROP INDEX [mtc_admin].[school].[school_pin_uindex];
ALTER TABLE [mtc_admin].[school] drop column pin;

--
-- Create a procedure to allocate a school pin
--
DROP PROCEDURE IF EXISTS [mtc_admin].[spGetSchoolPin];
GO
CREATE PROCEDURE [mtc_admin].[spGetSchoolPin]
@schoolId INT
AS

-- make sure we are not in an existing transaction
IF @@TRANCOUNT <> 0
    -- Rollback old transactions before starting another
    ROLLBACK TRANSACTION

BEGIN TRY
    BEGIN TRANSACTION

    UPDATE mtc_admin.schoolPin
    SET school_id = @schoolId
        OUTPUT inserted.id, inserted.schoolPin, inserted.school_id
    WHERE id = (
        SELECT TOP (1) d1.id
        FROM
        (
            SELECT TOP (100) id
            FROM  mtc_admin.schoolPin TABLESAMPLE (1000 ROWS)
            WHERE school_id IS NULL
            ORDER BY NEWID()
        ) as d1
    )

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

