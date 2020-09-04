DELETE
  FROM mtc_reports.userInputType;
INSERT INTO mtc_reports.userInputType (name, code)
VALUES ('Mouse', 'M'),
       ('Keyboard', 'K'),
       ('Touch', 'T'),
       ('Unknown', 'X');
