-- Delete the check started status prior to 2020 check
-- We assume existing check table is empty or may end up with FK errors.
DELETE FROM [mtc_admin].[checkStatus]
WHERE code = 'STD';
