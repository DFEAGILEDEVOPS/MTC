# SQL Migrations & Seeding

## Creating migrations

- Migrations can be written in Javascript or SQL
- Javascript migrations must export a generateSql function

Use the create-migration.js tool to create a new migration:

```
node sql/create-migration.js <name> (default type is sql)
node sql/create-migration.js <name> --type sql
node sql/create-migration.js <name> --type js
```
Generated migrations have the filename yyyymmddhhmmss.<do|undo>.name.<sql|js>


## Running migrations

- The migration script will execute *all* migrations up or down to a given version

```
node sql/migrate-sql.js
node sql/migrate-sql.js max
node sql/migrate-sql.js yyyymmddhhmmss
```

## Creating seeds

- Seeds can be written in Javascript, SQL or TSV
- Javascript seeds must export a generateSql function
- TSV seeds specify the column names in the first row

Use the create-seed.js tool to create a new seed.

```
node sql/create-seed.js <name> --table <table> (default type is tsv)
node sql/create-seed.js <name> --type sql (default table is custom for sql & js)
node sql/create-seed.js <name> --table <table> --format <tsv|sql|js>
```
Generated seeds have the filename yyyymmddhhmmss.table.name.<sql|tsv|js>

## Running seeds

- The seed script will execute all seeds or a given seed

```
node sql/seed-sql.js
node sql/seed-sql.js all
node sql/seed-sql.js yyyymmddhhmmss
```