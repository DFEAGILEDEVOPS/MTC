# MSSQL Patterns

Taken from https://github.com/jon-shipley/patterns/blob/master/mssql-idempotent-sql.md

## Table of contents
1. [Columns](#Columns)
2. [Constraints](#Constraints)
3. [Indexes](#Indexes)
4. [Tables](#Tables)
5. [Views](#Views)
6. [Triggers](#Triggers)
7. [Procedures](#Procedures)
8. [Documentation](#Documentation)
9. [Users](#Users)

## Reserved words checking tool

<https://www.petefreitag.com/tools/sql_reserved_words_checker>

## Indexes

### Drop Index

```tsql
DROP INDEX IF EXISTS [schema].[table].[index_name];
```

### Create Index

```tsql
IF EXISTS(SELECT * FROM sys.indexes WHERE object_id = object_id('schema.table') AND NAME ='index_name')
BEGIN
    DROP INDEX index_name ON schema.table;
END
CREATE INDEX index_name ON schema.table([column_list]);
```

## Constraints

### Drop a default value

```tsql
    IF EXISTS (
            select *
              from sys.all_columns c
                   join sys.tables t on t.object_id = c.object_id
                   join sys.schemas s on s.schema_id = t.schema_id
                   join sys.default_constraints d on c.default_object_id = d.object_id
             where t.name = 'table'
               and c.name = 'columnName'
               and s.name = 'schema')
        BEGIN
            ALTER TABLE [schema].[table]
            DROP CONSTRAINT [DF_<name>];
        END
```

### Add a default value

```tsql
    IF NOT EXISTS (
            select *
              from sys.all_columns c
                   join sys.tables t on t.object_id = c.object_id
                   join sys.schemas s on s.schema_id = t.schema_id
                   join sys.default_constraints d on c.default_object_id = d.object_id
             where t.name = 'table'
               and c.name = 'columnName'
               and s.name = 'schema')
        ALTER TABLE [schema].[table]
        ADD CONSTRAINT [DF_<name>]
        DEFAULT <defaultValue> FOR [columnName];
```

### Drop a Foreign Key constraint

```tsql
IF EXISTS(SELECT *
            FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
           WHERE CONSTRAINT_COLUMN_USAGE.TABLE_SCHEMA = 'schema'
             AND CONSTRAINT_COLUMN_USAGE.TABLE_NAME = 'table'
             AND CONSTRAINT_COLUMN_USAGE.COLUMN_NAME = 'columnName'
             AND CONSTRAINT_NAME = 'FK_<name>')
    BEGIN
        ALTER TABLE [schema].[table]
            DROP CONSTRAINT [FK_<name>];
    END
```

### Add a Foreign Key Constraint

```tsql
IF NOT EXISTS(SELECT *
                FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
               WHERE CONSTRAINT_COLUMN_USAGE.TABLE_SCHEMA = 'schema'
                 AND CONSTRAINT_COLUMN_USAGE.TABLE_NAME = 'table'
                 AND CONSTRAINT_COLUMN_USAGE.COLUMN_NAME = 'columnName'
                 AND CONSTRAINT_NAME = 'FK_<name>')
    BEGIN
        ALTER TABLE [schema].[table]
            ADD CONSTRAINT [FK_<name>]
                FOREIGN KEY (colName) REFERENCES [schema].[table] (columnName);
    END
```

## Columns
### Drop a column

```tsql
IF EXISTS(
        SELECT * FROM sys.columns
         WHERE object_ID=object_id('schema.table')
           AND col_name(object_ID,column_Id)='columnName'
    )
    BEGIN
        ALTER TABLE [schema].[table]
            DROP COLUMN [columnName];
    END;
```

Or, more simply

```tsql
 ALTER TABLE [schema].[table] DROP COLUMN IF EXISTS  [columnName1], COLUMN IF EXISTS [columnName2], ...;
```

### Add a column
```tsql
IF NOT EXISTS(
                SELECT *
                FROM sys.columns
               WHERE object_ID = object_id('schema.table')
                 AND col_name(object_ID, column_Id) = 'columnName')
    BEGIN
        ALTER TABLE [schema].[table]
            ADD [columnName] <type>;
    END
```

## Tables

### Drop table (SQL Server 2019)
```tsql
DROP TABLE IF EXISTS [schema].[table];
```

#### Create a table
```tsql
IF NOT EXISTS(SELECT *
                FROM INFORMATION_SCHEMA.TABLES
               WHERE TABLE_NAME = 'tableName'
                 AND TABLE_SCHEMA = 'schema')
BEGIN
    <table definition>
END
```

## Views

# Drop a view
```tsql
DROP VIEW IF EXISTS [schema].[viewName];
```

# Create a view
Just drop it and then create it.

```tsql
DROP VIEW IF EXISTS [schema].[viewName];

CREATE VIEW [schema].[viewName]
AS
SELECT * from [schema.table];
```

## Triggers

You can find out if a trigger exists using something like:
```tsql
SELECT * FROM sys.triggers
WHERE [parent_id] = OBJECT_ID('schema.table')
AND [name] = 'triggerName';
```

Note: SQL Server 2019 - dropping a table automatically drops any associated triggers.

### Drop a Trigger

```tsql
DROP TRIGGER IF EXISTS [schema].[triggerName];
```

### Create a trigger

You probably want to make sure the table for the trigger exists and then ensure that the
latest trigger definition is applied.  We have to use `EXEC` to run the `CREATE TRIGGER` command
as otherwise we will get a syntax error.  It must be the first statement in the batch.  Using
`CREATE OR ALTER TRIGGER` means any old definition will be updated with the latest.

```tsql
IF EXISTS(SELECT *
            FROM INFORMATION_SCHEMA.TABLES
           WHERE TABLE_NAME = 'tableName'
             AND TABLE_SCHEMA = 'schema')
EXEC('CREATE OR ALTER TRIGGER [schema].[triggerName]
    ON [schema].[tableName]
    FOR UPDATE AS
BEGIN
    <trigger definition>
END')

```

## Procedures

### Drop a stored procedure

```tsql
DROP PROCEDURE IF EXISTS [schema].<procedureName>;
```

### Create a stored procedure

```tsql
CREATE OR REPLACE <procedureName>
```


## Documentation

### View documentation on extended attributes

These queries allow you to see all the documentation on columns and database objects in a single result view for each.

```tsql
-- Useful queries here: https://www.mssqltips.com/sqlservertip/5384/working-with-sql-server-extended-properties/
--

-- Get column level extended attributes
--
SELECT
    s.name schemaName,
	t.name tableName,
	c.name columnName,
	CAST(
		e.value AS NVARCHAR(MAX)
	) extendedProperties
FROM
	sys.schemas s
	JOIN sys.tables t ON (s.schema_id = t.schema_id)
	JOIN sys.columns c ON t.object_id = c.object_id
	LEFT JOIN sys.extended_properties e ON (t.object_id = e.major_id)
	AND c.column_id = e.minor_id
	AND e.name = 'MS_Description'
ORDER BY
	s.name,
	t.name,
	c.column_id;


-- Get table level extended attributes
--
SELECT
	SCHEMA_NAME(t.schema_id) AS SchemaName,
	t.name AS tableName,
	p.name AS ExtendedPropertyName,
	CAST(p.value AS nvarchar(max)) AS ExtendedPropertyValue
FROM
	sys.tables AS t
	INNER JOIN sys.extended_properties AS p ON p.major_id = t.object_id
	AND p.minor_id = 0
	AND p.class = 1;
```

### Add a comment to a Table

```tsql
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = N'This table does something wonderful...',
     @level0type = N'SCHEMA', @level0name = '<your schema>', @level1type = N'TABLE', @level1name = '<your table name>';
```

### Add a comment to a Column
```tsql
EXEC sys.sp_addextendedproperty @name = N'MS_Description', @value = 'A wonderful comment about the column.', @level0type = N'Schema',
     @level0name = '<your schema>', @level1type = N'Table', @level1name = '<your table name>', @level2type = N'Column',
     @level2name = '<your col name>';
```


## Users
### Check to see if a user exists
```tsql
SELECT
    name AS username,
	create_date,
	modify_date,
	type_desc AS TYPE,
	authentication_type_desc AS authentication_type
FROM
	sys.database_principals
WHERE
	TYPE NOT IN ('A', 'G', 'R', 'X')
	AND sid IS NOT NULL
ORDER BY
	username;
```

So you can check to see if a user exists before creating it:

```tsql
IF NOT EXISTS (SELECT [name]
                FROM [sys].[database_principals]
                WHERE [type] = N'S' AND [name] = N'<NEW_USER>')
BEGIN
    CREATE USER [<NEW_USER>] WITH PASSWORD [<PASSWORD>], DEFAULT_SCHEMA=[<SOME_SCHEMA>]
END
```
