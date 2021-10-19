select CAST(ABS(CHECKSUM(NEWID())) % 2 AS char(1)) [Random Bit]
select CHECKSUM(NEWID()) [Random Number]
SELECT '''' + LEFT(CAST(NEWID() AS VARCHAR(255)), FLOOR((50 / 2.0)) + 1) + '''' [Random UUID section]