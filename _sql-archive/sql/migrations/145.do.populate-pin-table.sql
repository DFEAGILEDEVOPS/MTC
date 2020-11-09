-- populate the pin table with all 4 digit pins that don't use 0 or 1
DROP TABLE IF EXISTS #pinStaging;
CREATE TABLE #pinStaging (pin INT);
GO

DECLARE @i int;
SET @i = 2222; -- start at 2222 as 0's and 1's aren't allowed

WHILE (@i < 10000)
BEGIN
  INSERT INTO #pinStaging (pin) VALUES (@i);
  SET @i = @i + 1;
END

-- 0 and 1 are not allowed in the pin
DELETE FROM #pinStaging where pin LIKE '%0%' or pin LIKE '%1%';

-- the staging step is only so we can insert the pins randomly
INSERT INTO [mtc_admin].[pin] ([val])
SELECT TOP 4096 pin from #pinStaging
ORDER BY NEWID();

DROP TABLE #pinStaging;
