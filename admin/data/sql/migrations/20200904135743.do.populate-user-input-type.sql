DELETE
  FROM mtc_results.userInputType;
INSERT INTO mtc_results.userInputType (name, code)
VALUES ('Mouse', 'M'),
       ('Keyboard', 'K'),
       ('Touch', 'T'),
       ('Unknown', 'X');
