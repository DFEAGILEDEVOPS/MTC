DELETE
  FROM mtc_results.userInputTypeLookup;

INSERT INTO mtc_results.userInputTypeLookup (name, code)
VALUES ('Mouse', 'M'),
       ('Keyboard', 'K'),
       ('Touch', 'T'),
       ('Unknown', 'X');
