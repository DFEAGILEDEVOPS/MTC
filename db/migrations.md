# SQL Migrations & Seeding

## Creating migrations

- Migrations can be written in Javascript or SQL
- Javascript migrations must export a generateSql function

Use your package manager (yarn or npm) to create a new migration:

```
yarn new <name> (default type is sql)
yarn new <name> --type sql
yarn new <name> --type js
```

Generated migrations will be created in the root folder (`/db`) with the filename format `yyyymmddhhmmss.<do|undo>.name.<sql|js>`
These should be moved to the respective folder under `migrations`, otherwise they will not be executed by the migration engine.

## Running migrations

The migration script will execute *all* migrations up or down to a given version

```
yarn migrate
yarn migrate max
yarn migrate yyyymmddhhmmss
```

## Creating seeds

- Seeds can be written in Javascript, SQL or TSV
- Javascript seeds must export a generateSql function
- TSV seeds specify the column names in the first row

Use your package manager to create a new seed.

```
yarn new-seed <name> --table <table> (default type is tsv)
yarn new-seed <name> --format sql (default table is custom for sql & js)
yarn new-seed <name> --table <table> --format <tsv|sql|js>
```
Generated seeds have the filename yyyymmddhhmmss.table.name.<sql|tsv|js>

## Running seeds

The seed script will execute all seeds or a given seed

```
yarn seed
yarn seed all
yarn seed yyyymmddhhmmss
```
