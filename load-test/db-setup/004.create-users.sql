INSERT INTO mtc_admin.[user] (identifier, passwordHash, school_id, role_id, displayName)
SELECT
    'teacher' + CAST(teacherId as nvarchar) as [identifier],
    'hash' as [passwordHash],
    schools.school_id,
    3 as [role_id],
    'teacher' + CAST(teacherId as nvarchar) as [displayName]
FROM
    (SELECT ROW_NUMBER() OVER(ORDER BY id) AS teacherId, id as [school_id]
        FROM mtc_admin.school) as schools
