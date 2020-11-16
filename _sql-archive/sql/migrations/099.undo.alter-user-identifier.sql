ALTER TABLE [mtc_admin].[user] DROP CONSTRAINT user_identifier_uindex;

ALTER TABLE [mtc_admin].[user] ALTER COLUMN [identifier] [nvarchar](max) NOT NULL;


