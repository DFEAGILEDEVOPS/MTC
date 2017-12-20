# Database Development Guidelines

## Table Design
- Each table must have a column named `id` as the primary key, data type `int`.
- Column names should be camel case.
- Foreign key references follow the format `table_column`.  For example, when referencing the `id` column in the `pupil` table, your column should be named `pupil_id`.
