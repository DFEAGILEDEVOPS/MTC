IF NOT EXISTS (SELECT id from [mtc_admin].[checkWindow] WHERE name = 'Past Development Phase')
BEGIN
INSERT INTO [mtc_admin].[checkWindow] ([name], adminStartDate, adminEndDate, checkStartDate, checkEndDate, familiarisationCheckStartDate, familiarisationCheckEndDate) 
VALUES ('Past Development Phase', '2017-06-01', '2017-09-01', '2017-07-01', '2017-09-01', '2017-07-01', '2017-09-01') 
END