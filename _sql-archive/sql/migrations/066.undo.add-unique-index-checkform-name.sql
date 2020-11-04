DROP INDEX [mtc_admin].[checkForm].checkForm_name_uindex;
ALTER TABLE [mtc_admin].[checkForm] ALTER COLUMN [name] NVARCHAR(max) NOT NULL;