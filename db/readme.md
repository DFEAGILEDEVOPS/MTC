# Core Database

## Overview
MTC uses SQL Server as its primary storage service.  All defined objects must be compatible with on-premise and azure based instances.

## Scripts
Postgrator is used to execute migration scripts in chronological order.  The migration scripts should be baselined periodically to keep file count low, which helps purge any older dependencies from the codebase (such as configuration items which javascript migrations may be dependent on).

## Creating Migrations
See the [migrations guide](migrations.md)

## Policy
Use of the `GO` statement within a migration is forbidden, due to the fact that this can [break atomicity and cause transactional rollback to fail within a migration](https://github.com/rickbergfalk/postgrator#preventing-partial-migrations)

## Baseline History
October 2020: Scripts baselined for first time

