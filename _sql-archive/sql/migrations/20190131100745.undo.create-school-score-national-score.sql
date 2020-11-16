DROP TABLE [mtc_admin].[schoolScore]

ALTER TABLE [mtc_admin].[checkWindow] DROP CONSTRAINT completeDefault
ALTER TABLE [mtc_admin].[checkWindow] DROP COLUMN complete

ALTER TABLE [mtc_admin].[checkWindow] DROP COLUMN score
