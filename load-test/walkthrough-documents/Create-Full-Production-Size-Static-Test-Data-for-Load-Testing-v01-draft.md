# Create Full Production Size Static Test Data for Load Testiing
---

## Task Overview

- Create a Teacher for each School


## Background



## Create a Teacher for each School



```sql

--==============================================================
-- UNIQUE CODE BLOCK IDENTIFIER - STA-MTC-LOAD-TEST-CODE-001v001

-- CODE VERSION v001


-- CREATE ONE TEACHER FOR EACH SCHOOL -- START SQL CODE BLOCK

DECLARE @schoolID INT = 16836;

DECLARE @teacherIndex INT;

DECLARE @teacherUsername VARCHAR(20); 

SET @teacherUsername = 'Teachernew';

DECLARE @loopFrom AS INT = 15636;
DECLARE @loopTo AS INT = 16835;

WHILE(@loopFrom <= @loopTo)
BEGIN
	SET @teacherIndex = @loopFrom
	--PRINT @teacherIndex;
	--PRINT '@teacherIndex CAST = ' + CAST(@teacherIndex as varchar(3));
    SET @teacherUsername = 'Teachernew' + CAST(@teacherIndex as varchar(6));

	--PRINT @teacherUsername;
	--PRINT @schoolID;
	INSERT INTO [mtc_admin].[user] (identifier, passwordHash, school_id, role_id)
	VALUES (@teacherUsername, '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK', @schoolID, 3);	

    SET @loopFrom += 1;
	--PRINT @loopFrom;
	SET @schoolID += 1;
	--PRINT @schoolID;
END

-- CREATE ONE TEACHER FOR EACH SCHOOL -- END SQL CODE BLOCK
--==============================================================


```

