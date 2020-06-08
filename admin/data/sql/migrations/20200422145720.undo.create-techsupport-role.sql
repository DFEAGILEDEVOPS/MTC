
IF EXISTS(SELECT * FROM mtc_admin.[user] u INNER JOIN mtc_admin.[role] r
ON u.role_id = r.id WHERE r.title = 'TECH-SUPPORT')
  BEGIN
    RAISERROR('unable to delete TECH-SUPPORT role as at least 1 user is assigned to that role', 18, 1)
  END
ELSE
  BEGIN
    DELETE FROM mtc_admin.[role] WHERE title = 'TECH-SUPPORT'
  END
