IF NOT EXISTS (
  SELECT 1
  FROM [mtc_admin].[user]
  WHERE identifier = 'superuser'
)
BEGIN
  INSERT INTO [mtc_admin].[user] (identifier, passwordHash, role_id, displayName)
  SELECT
    'superuser',
    '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK',
    id,
    'Superuser Local User'
  FROM [mtc_admin].[role]
  WHERE title = 'SUPERUSER';
END;
