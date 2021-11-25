'use strict'


module.exports.generateSql = function () {
  if (process.env.NODE_ENV !== 'production') {
    return `
-- Stored Procedure
--  Author: Jon Shipley
--  Creation date: 25 Nov 2021
--  Description: Generate test pupils, e.g for Load Test
-- Change History:
--  2021-11-25: Initial version
--
-- Examples:
-- Create 50 test pupils for all schools
-- EXEC [mtc_admin].[spGenTestPupils] @numPupils = 50, @schoolIdFrom = 2, @schoolIdTo = 2;
--
-- Create 5 pupils for school 2 only
-- EXEC [mtc_admin].[spGenTestPupils] @numPupils = 5, @schoolIdFrom = 2, @schoolIdTo = 2;
--
-- Create 10 pupils for schools 2,3,4,5 inclusive
-- EXEC [mtc_admin].[spGenTestPupils] @numPupils = 10, @schoolIdFrom = 2, @schoolIdTo = 5;
--
CREATE OR ALTER PROCEDURE [mtc_admin].[spGenTestPupils]
    @numPupils INT,
    @schoolIdFrom INT = NULL,
    @schoolIdTo   INT = NULL
AS
IF @numPupils IS NULL
    THROW 51000, 'The parameter @numPupils must be provided.', 1;

INSERT INTO [mtc_admin].[pupil]
    (school_id, foreName, lastName, gender, dateOfBirth, upn)
SELECT
    school.id,
    CONCAT('Pupil', CAST(temp30.rowNumber AS VARCHAR)), -- foreName
    CONCAT('School', CAST(school.id AS VARCHAR)), -- lastName
    IIF(CRYPT_GEN_RANDOM(1) % 2 = 1, 'M', 'F'), -- M or F
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
    ),

    [mtc_admin].upnCheckLetter(
        CAST(CONCAT(
            CAST(temp30.laCode as VARCHAR),    -- 3 digit lea code
            FORMAT(ROUND(RAND(CHECKSUM(NEWID())) * 9999, 0), '0000'), -- 4 digit estab code
            FORMAT(ROUND(RAND(CHECKSUM(NEWID())) * 99, 0), '00'),  -- 2 digit creation year
            FORMAT(ROUND(RAND(CHECKSUM(NEWID())) * 999, 0), '000') -- 3 digit serial
        ) AS BIGINT)
    )
FROM
    [mtc_admin].[school] school CROSS JOIN (
        SELECT
        TOP (@numPupils) -- Generate this number of pupils per school
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
WHERE 1=1
-- Add where clause like 'AND school.id >= @schoolIdFrom'
AND CASE WHEN @schoolIdFrom IS NOT NULL
    THEN school.id
    ELSE 1
    END
    >=
    CASE WHEN @schoolIdFrom IS NOT NULL
    THEN @schoolIdFrom
    ELSE 1
    END
-- Add where clause like 'AND school.id <= @schoolIdTo'
AND CASE WHEN @schoolIdTo IS NOT NULL
    THEN school.id
    ELSE 1
    END
    <=
    CASE WHEN @schoolIdTo IS NOT NULL
    THEN @schoolIdTo
    ELSE 1
    END
ORDER BY school.id, temp30.rowNumber
;
`
  }
  return ''
}
