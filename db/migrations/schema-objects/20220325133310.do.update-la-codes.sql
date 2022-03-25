--
-- Idempotently insert the data in case we decide to manually patch this before the
-- PR is deployed.
--
IF NOT EXISTS (SELECT * from mtc_admin.laCodeLookup WHERE laCode = 940)
  INSERT INTO mtc_admin.laCodeLookup (laCode, laName) VALUES (940, 'North Northamptonshire')
;

IF NOT EXISTS (SELECT * FROM mtc_admin.laCodeLookup where laCode = 941)
  INSERT INTO mtc_admin.laCodeLookup (laCode, laName) VALUES (941, 'West Northamptonshire')
;

