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
      WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = ON, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
    CONSTRAINT [IX_schoolPin_schoolPin_unique] UNIQUE (schoolPin),
    CONSTRAINT [FK_schoolPin_school_id_school_id] FOREIGN KEY (school_id) REFERENCES [mtc_admin].[school](id)
  );
GO

DROP TABLE IF EXISTS [mtc_admin].[wordlist];
CREATE TABLE [mtc_admin].[wordlist]
(
  word        [nvarchar](6) NOT NULL,
  [createdAt] [datetimeoffset](3)  NOT NULL DEFAULT GETUTCDATE(),
  [updatedAt] [datetimeoffset](3)  NOT NULL DEFAULT GETUTCDATE(),
  [version]   [rowversion],
  CONSTRAINT  [PK_wordlist] PRIMARY KEY CLUSTERED ([word] ASC)
      WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = ON, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON),
);
GO

--
-- Generate 128 random words to use as test words in lower environments
--
BEGIN
    declare @alphabet varchar(26) = 'abcdefghijklmnopqrstuvwxyz';
    declare @numInserts int = 0
    begin
        while @numInserts < 129
        begin
            insert into [mtc_admin].[wordlist] (word)
            select substring(@alphabet, convert(int, ceiling(rand() * 26)), 1) +
                   substring(@alphabet, convert(int, ceiling(rand() * 26)), 1) +
                   substring(@alphabet, convert(int, ceiling(rand() * 26)), 1);
            set @numInserts = @numInserts + 1
        end
    end
end

--   --
--   -- small list to generate 25K records for comparison with existing migration
--   --
-- INSERT INTO mtc_admin.wordlist (word) values ('aaa'),
--                                              ('bcd'),
--                                              ('dcd'),
--                                              ('tfg'),
--                                              ('bxx'),
--                                              ('foo'),
--                                              ('bar'),
--                                              ('baz'),
--                                              ('zab'),
--                                              ('rab'),
--                                              ('cet'),
--                                              ('rep'),
--                                              ('waf'),
--                                              ('cdr'),
--                                              ('str'),
--                                              ('piq'),
--                                              ('sah'),
--                                              ('inn'),
--                                              ('tej'),
--                                              ('tyl');


--
-- Generate all school pins available from the base word list
-- V2 *** 300ms <-> 6s  for 1 million entries ***  select cartesian products including all numbers
BEGIN
  WITH x AS
         (
           select
             w1.word as w1,
             digits.num as digits,
             w2.word as w2
           FROM
             mtc_admin.wordlist w1 cross join
             mtc_admin.wordlist w2 cross join
             (select
                  A.col + B.col [num]
              FROM
                (values ('2'), ('3'), ('4'), ('5'), ('6'), ('7'), ('8'), ('9')) as A(col) cross join
                (values ('2'), ('3'), ('4'), ('5'), ('6'), ('7'), ('8'), ('9')) as B(col)) as digits
           where
             w1.word is not null and w2.word is not null
             AND w1.word <> w2.word
         )
  INSERT INTO mtc_admin.schoolPin (schoolPin)
  SELECT x.w1 + x.digits + x.w2
  FROM x;
END



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
