ALTER TABLE [mtc_admin].[sce] ADD countryCode CHAR(2) NOT NULL CONSTRAINT temp_default_country_code DEFAULT 'UK';
ALTER TABLE [mtc_admin].[sce]
DROP CONSTRAINT temp_default_country_code;
