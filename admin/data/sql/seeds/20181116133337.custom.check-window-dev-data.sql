IF NOT EXISTS (SELECT id from [mtc_admin].[checkWindow] WHERE name = 'Development Phase')
BEGIN
INSERT INTO [mtc_admin].[checkWindow] ([name], adminStartDate, adminEndDate, checkStartDate, checkEndDate, familiarisationCheckStartDate, familiarisationCheckEndDate)
VALUES ('Development Phase', '2017-12-01', '2018-06-01', '2017-12-22', '2019-02-01', '2017-12-22', '2018-06-01')
END
