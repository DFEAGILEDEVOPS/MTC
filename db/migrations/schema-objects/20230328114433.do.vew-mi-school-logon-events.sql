CREATE OR ALTER VIEW mtc_admin.[vewMiSchoolLogonEvents] AS
  SELECT ale.createdAt as [loggedOnAt],
    ale.loginMethod,
    ale.user_id,
    ale.school_id,
    JSON_VALUE(ale.body, '$.organisation.urn') as [urn],
    JSON_VALUE(ale.body, '$.role') as [role]
     FROM mtc_admin.adminLogonEvent ale
     WHERE ale.isAuthenticated = 1
