-- no undo since pupil status was dropped
-- no undo as it depends on tables that have been deleted
CREATE OR ALTER PROCEDURE [mtc_admin].[spGetPupilsResults] AS
SELECT 'not replaced';
