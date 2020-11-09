ALTER TABLE [mtc_admin].[user] ALTER COLUMN [identifier] [nvarchar](64) NOT NULL;

-- a user can only have one identifier in the user table
ALTER TABLE [mtc_admin].[user] ADD CONSTRAINT user_identifier_uindex UNIQUE (identifier);
