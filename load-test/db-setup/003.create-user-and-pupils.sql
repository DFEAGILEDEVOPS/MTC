
CREATE OR ALTER FUNCTION upnCheckLetter (
    @protoUpn BIGINT
)
RETURNS VARCHAR(13)
AS
BEGIN
    DECLARE @baseStr VARCHAR(13);
    DECLARE @chr2 TINYINT;
    DECLARE @chr3 TINYINT;
    DECLARE @chr4 TINYINT;
    DECLARE @chr5 TINYINT;
    DECLARE @chr6 TINYINT;
    DECLARE @chr7 TINYINT;
    DECLARE @chr8 TINYINT;
    DECLARE @chr9 TINYINT;
    DECLARE @chr10 TINYINT;
    DECLARE @chr11 TINYINT;
    DECLARE @chr12 TINYINT;
    DECLARE @chr13 TINYINT;
    DECLARE @result INT;
    DECLARE @remainder INT;
    DECLARE @checkLetter CHAR(1);
    --
    -- Convert the int arg to a string so we can easily extract each digit
    --
    SET @baseStr = CAST(@protoUpn as VARCHAR)
    --
    -- The following character extractions are off-by one as variable naming follows the UPN
    -- documentation which marks the first char of the upn as the check-letter, which is what
    -- we are calculating here.
    --
    SET @chr2 = CAST(SUBSTRING(@baseStr, 1, 1) AS TINYINT)
    SET @chr3 = CAST(SUBSTRING(@baseStr, 2, 1) AS TINYINT)
    SET @chr4 = CAST(SUBSTRING(@baseStr, 3, 1) AS TINYINT)
    SET @chr5 = CAST(SUBSTRING(@baseStr, 4, 1) AS TINYINT)
    SET @chr6 = CAST(SUBSTRING(@baseStr, 5, 1) AS TINYINT)
    SET @chr7 = CAST(SUBSTRING(@baseStr, 6, 1) AS TINYINT)
    SET @chr8 = CAST(SUBSTRING(@baseStr, 7, 1) AS TINYINT)
    SET @chr9 = CAST(SUBSTRING(@baseStr, 8, 1) AS TINYINT)
    SET @chr10 = CAST(SUBSTRING(@baseStr, 9, 1) AS TINYINT)
    SET @chr11 = CAST(SUBSTRING(@baseStr, 10, 1) AS TINYINT)
    SET @chr12 = CAST(SUBSTRING(@baseStr, 11, 1) AS TINYINT)
    SET @chr13 = CAST(SUBSTRING(@baseStr, 12, 1) AS TINYINT)
    --
    -- Find the sum according to https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/807381/UPN_Guide_1.2.pdf
    --
    SET @result = (@chr2 * 2) + (@chr3 * 3) + (@chr4 * 4) + (@chr5 * 5) + (@chr6 * 6) + (@chr7 * 7) + (@chr8 * 8) + (@chr9 * 9) + (@chr10 * 10) + (@chr11 * 11) + (@chr12 * 12) + (@chr13 * 13);
    SET @remainder = @result % 23;
    --
    -- Find the check letter by looking up the remainder number
    --
    IF @remainder = 0
        SET @checkLetter = 'A'
    ELSE IF @remainder = 1
        SET @checkLetter = 'B'
    ELSE IF @remainder = 2
        SET @checkLetter = 'C'
    ELSE IF @remainder = 3
        SET @checkLetter = 'D'
    ELSE IF @remainder = 4
        SET @checkLetter = 'E'
    ELSE IF @remainder = 5
        SET @checkLetter = 'F'
    ELSE IF @remainder = 6
        SET @checkLetter = 'G'
    ELSE IF @remainder = 7
        SET @checkLetter = 'H'
    ELSE IF @remainder = 8
        SET @checkLetter = 'J'
    ELSE IF @remainder = 9
        SET @checkLetter = 'K'
    ELSE IF @remainder = 10
        SET @checkLetter = 'L'
    ELSE IF @remainder = 11
        SET @checkLetter = 'M'
    ELSE IF @remainder = 12
        SET @checkLetter = 'N'
    ELSE IF @remainder = 13
        SET @checkLetter = 'P'
    ELSE IF @remainder = 14
        SET @checkLetter = 'Q'
    ELSE IF @remainder = 15
        SET @checkLetter = 'R'
    ELSE IF @remainder = 16
        SET @checkLetter = 'T'
    ELSE IF @remainder = 17
        SET @checkLetter = 'U'
    ELSE IF @remainder = 18
        SET @checkLetter = 'V'
    ELSE IF @remainder = 19
        SET @checkLetter = 'W'
    ELSE IF @remainder = 20
        SET @checkLetter = 'X'
    ELSE IF @remainder = 21
        SET @checkLetter = 'Y'
    ELSE IF @remainder = 22
        SET @checkLetter = 'Z'

    RETURN CONCAT(@checkLetter, CAST(@protoUpn AS VARCHAR))
END
GO

--
-- INSERT 30 random pupils per school
--
INSERT INTO [mtc_admin].[pupil]
	(school_id, foreName, lastName, gender, dateOfBirth, upn)
SELECT
    school.id as schoolId,
    -- temp30.rowNumber, -- not needed / debug
    CONCAT('Pupilaac', CAST(temp30.rowNumber AS VARCHAR)), -- foreName
    CONCAT('Schoolaac', CAST(school.id AS VARCHAR)), -- lastName
    IIF(CRYPT_GEN_RANDOM(1) % 2 = 1, 'M', 'F') as gender, -- M or F
    DATEADD(
		YEAR,
		-8,        -- subtract 8 years to make the pupil at least 8 years old
		DATEADD(
			DAY,
			- ABS( -- further subtract a random number of days between 0 and 363
				CHECKSUM(
					NEWID()
				) % 364
			),
			CONCAT(YEAR(GETDATE()), '-09-01') -- E.g. The date to start our subtractions from: e.g. '2021-09-01' which is the start of the school year
		)
	) as dateOfBirth,
		[mtc_admin].[upnCheckLetter](
        CAST(CONCAT(
            CAST(temp30.laCode as VARCHAR),    -- 3 digit lea code
            FORMAT(ROUND(RAND(CHECKSUM(NEWID())) * 9999, 0), '0000'), -- 4 digit estab code
            FORMAT(ROUND(RAND(CHECKSUM(NEWID())) * 99, 0), '00'),  -- 2 digit creation year
            FORMAT(ROUND(RAND(CHECKSUM(NEWID())) * 999, 0), '000') -- 3 digit serial
        ) AS BIGINT)
    ) as upn
FROM
    mtc_admin.school school CROSS JOIN (
		SELECT
        TOP (40) -- Generate 30 pupils per school
        s.id,
        s.name,
        lea.laCode,
        ROW_NUMBER() OVER (
				ORDER BY (SELECT NULL)
			) AS rowNumber
    FROM
        [mtc_admin].[school] s
        CROSS JOIN [mtc_admin].[laCodeLookup] lea
        WHERE lea.laCode <> 0 -- this lea code means that the lea code does not apply, but we want 3 digit leaCodes to make a upn
	) as temp30
ORDER BY school.id, temp30.rowNumber;
