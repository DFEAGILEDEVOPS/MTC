ALTER TABLE [mtc_admin].checkForm
    ADD urlSlug uniqueidentifier
    CONSTRAINT urlSlugDefault DEFAULT newid() NOT NULL
