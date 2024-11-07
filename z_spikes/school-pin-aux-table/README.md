The ddl.sql can be used to setup a working schoolPin table.  Whilst the migration.js script will setup 25K records we need
more records to get a feel for production volume data.

Instead of loading the migration you can use something like this to very quickly add 1 million rows of pins:

```
WITH x AS
(
  SELECT TOP (1000000) s1.[object_id]
  FROM sys.all_objects AS s1
  CROSS JOIN sys.all_objects AS s2
  ORDER BY s1.[object_id]
)
INSERT mtc_admin.schoolPin (schoolPin)
SELECT
    n = ROW_NUMBER() OVER (ORDER BY NEWID())
FROM x;
```


We need to pick a random pin from the available unused pins.  We could use something like this:

query a)
```SQL
 SELECT TOP (1) id, schoolPin
 FROM mtc_admin.schoolPin
 WHERE school_id IS NOT NULL
 ORDER BY NEWID();
 ```

 Performance is very good.  With 1 million rows loaded:  (execution: 6 ms, fetching: 145 ms)

 query b)  This attempted to see if we could improve on the above by not ordering so many records
 ```SQL
  SELECT TOP (1) d1.id
     FROM
     (
         SELECT TOP (100) id
         FROM  mtc_admin.schoolPin TABLESAMPLE (1000 ROWS)
         WHERE school_id IS NULL
         ORDER BY NEWID()
     ) as d1
 ```

 Performance is similar: (execution: 8 ms, fetching: 151 ms)

 TABLESAMPLE will fetch a slightly variable number of rows in a sequence, which could be quite useful, as it would
 provide something like clustered sampling.  You need to fetch a relatively high number of rows as tests showed that
 choosing only 100 rows sometimes returned zero rows.  Internally TABLESAMPLE converts 'n' ROWS to a percentage, and in
 a large table size this may be getting rounded down.

Note - we would probably want to move the school pin expiry date from the school table to the schoolPin table.
