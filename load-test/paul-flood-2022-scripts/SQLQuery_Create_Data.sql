
SELECT * FROM [mtc_admin].[school]

SELECT * FROM [mtc_admin].[school] where ID = 2214

SELECT * FROM [mtc_admin].[user]


--==============================================================
-- UNIQUE CODE BLOCK IDENTIFIER - STA-MTC-LOAD-TEST-CODE-001v001

-- CODE VERSION v001


-- CREATE ONE TEACHER FOR EACH SCHOOL -- START SQL CODE BLOCK

DECLARE @schoolID INT = 16836;

DECLARE @teacherIndex INT;

DECLARE @teacherUsername VARCHAR(20); 

SET @teacherUsername = 'Teacher';

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




--==============================================================
-- CREATE PUPILS FOR EACH SCHOOL -- START SQL CODE BLOCK

-- UNIQUE CODE BLOCK IDENTIFIER - STA-MTC-LOAD-TEST-CODE-002v001

-- CODE VERSION v001


-- Load Test Data Naming Conventions required for data loading

-- Unique Load Test Data Set Identifier - Format xxx - 'new'

-- 'Teacherxxx1' 'Schoolxxx2' 'Pupilxxx1' - 'Pupilxxx40'


-- Set Data Create Variables

DECLARE @testDataSetIdentifier VARCHAR(3) = 'new';

DECLARE @pupilPerSchool INT = 40;

DECLARE @schoolIdStartRange INT = 2;

DECLARE @schoolIdStartRange INT = 3;

-- DECLARE @academicYearStartMonth = 2021;

-- DECLARE @academicYearStartYear = 2021;

-- DECLARE @pupilDobStartAge = 9;

-- DECLARE @pupilDobStartAge = 10;

- 
DECLARE @MyDatetimeoffset datetimeoffset(3) = '2012-12-26 00:00:00.000 +00:00';

-- CAST('2019-02-28 01:45:00.0000000 -08:00' AS DATETIMEOFFSET));

-- PRINT @MyDatetimeoffset

-- Create Valid  UPN


-- Check letter

-- Check Letter Table
/*
0 = A 1 = B 2 = C 3 = D 4 = E 5 = F
6 = G 7 = H 8 = J 9 = K 10 = L 11 = M
12 = N 13 = P 14 = Q 15 = R 16 = T 17 = U
18 = V 19 = W 20 = X 21 = Y 22 = Z
*/

-- A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,T,U,V,W,X,Y,Z


-- Local authority number - 2021 All LA Numbers
/*
201,202,203,204,205,206,207,208,209,210,211,212,213,301,302,303,304,305,306,307,308,309,310,311,312,
313,314,315,316,317,318,319,320,330,331,332,333,334,335,336,340,341,342,343,344,350,351,352,353,354,
355,356,357,358,359,370,371,372,373,380,381,382,383,384,390,391,392,393,394,420,800,801,802,803,805,
806,807,808,810,811,812,813,815,816,820,821,822,823,825,826,830,831,835,836,837,838,839,840,841,845,
355,356,357,358,359,370,371,372,373,380,381,382,383,384,390,391,392,393,394,420,800,801,802,803,805,
846,850,851,852,855,856,857,860,861,865,866,867,868,869,870,871,872,873,874,875,876,877,878,879,880,
881,882,883,884,885,886,887,888,889,890,891,892,893,894,895,896,901,902,903,904,905,906,907,908,909,
910,911,912,913,914,915,916,917,918,919,920,921,922,923,924,925,926,927,928,929,930,931,932,933,934,
*/

-- Departmental establishment number

-- Year of allocation

-- Serial number


--INSERT INTO [mtc_admin].[pupil] (school_id, foreName, lastName, gender, dateOfBirth, upn)
--VALUES (2, 'Pupil 61', 'School2' , 'F', @MyDatetimeoffset, 'A00000000121A');


-- CREATE PUPILS FOR EACH SCHOOL -- END SQL CODE BLOCK
--==============================================================

