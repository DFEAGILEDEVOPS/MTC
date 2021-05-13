INSERT INTO mtc_admin.[user] (identifier, passwordHash, role_id, displayName)
VALUES ('sta-admin', '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK',
        (SELECT id from mtc_admin.role WHERE title = 'STA-ADMIN'), 'STA Admin User');
