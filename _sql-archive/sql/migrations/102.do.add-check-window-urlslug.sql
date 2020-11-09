ALTER TABLE [mtc_admin].[checkWindow] ADD urlSlug uniqueidentifier DEFAULT newid() NOT NULL
CREATE UNIQUE INDEX checkWindow_urlSlug_uindex ON [mtc_admin].[checkWindow] (urlSlug)
