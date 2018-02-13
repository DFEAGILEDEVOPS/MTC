ALTER TABLE [mtc_admin].[checkForm] ALTER COLUMN [name] NVARCHAR(60) NOT NULL;
CREATE UNIQUE INDEX checkForm_name_uindex ON [mtc_admin].checkForm ([name]);