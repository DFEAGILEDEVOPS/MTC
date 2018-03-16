INSERT INTO [mtc_admin].[user] (identifier, passwordHash, role_id)
VALUES
  ('helpdesk',
   '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK',
   (select [id] from [mtc_admin].[role] where title = 'HELPDESK')
);
