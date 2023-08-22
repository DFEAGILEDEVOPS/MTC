ALTER TABLE [mtc_admin].[check]
    ADD [void] BIT CONSTRAINT [DF_check_void_default] DEFAULT 0 NOT NULL;
