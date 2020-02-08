-- no undo as it depends on tables that have been deleted
CREATE OR ALTER PROCEDURE [mtc_admin].[spRefreshScoreData] AS
SELECT 'not replaced';
