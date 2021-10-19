/* select CAST(ABS(CHECKSUM(NEWID())) % 2 AS char(1)) [Random Bit]
select CHECKSUM(NEWID()) [Random Number]
SELECT '''' + LEFT(CAST(NEWID() AS VARCHAR(255)), 13) + '''' [Random UUID section] */

DECLARE @foreName nvarchar(128)
DECLARE @middleNames nvarchar(128)
DECLARE @lastName nvarchar(128)
DECLARE @dateOfBirth datetimeoffset(3) = '1970-01-01'
DECLARE @upn char(13)
DECLARE @namePartLengths int = 128



SELECT @foreName = LEFT(CAST(NEWID() AS VARCHAR(255)), FLOOR((@namePartLengths / 2.0)) + 1)
SELECT @middleNames = LEFT(CAST(NEWID() AS VARCHAR(255)), FLOOR((@namePartLengths / 2.0)) + 1)
SELECT @lastName = LEFT(CAST(NEWID() AS VARCHAR(255)), FLOOR((@namePartLengths / 2.0)) + 1)
SELECT @upn = LEFT(CAST(NEWID() AS VARCHAR(255)), 13)

select @foreName as [foreName], @middleNames as [middleNames], @lastName as [lastName], @upn as [upn]