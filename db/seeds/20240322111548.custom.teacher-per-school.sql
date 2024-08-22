INSERT INTO mtc_admin.[user] (identifier, passwordHash, school_id, role_id, displayName)
SELECT
    'teacher' + CAST(schools.urn AS NVARCHAR) as [identifier],
    '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK' as [passwordHash],
    schools.school_id,
    3 as [role_id],
    'teacher' + CAST(schools.urn AS NVARCHAR) as [displayName]
FROM (SELECT id as school_id, urn FROM mtc_admin.school where id NOT IN
  (SELECT school_id FROM mtc_admin.[user] WHERE school_id IS NOT NULL AND role_id=3)) as schools
