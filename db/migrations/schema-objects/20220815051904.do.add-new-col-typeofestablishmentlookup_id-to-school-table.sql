--
-- Add the type of establishment into the school table
-- This data is only known during the school upload
-- so we cannot yet make it not null.
--

ALTER TABLE [mtc_admin].[school]
ADD typeOfEstablishmentLookup_id INT;

GO

ALTER TABLE [mtc_admin].[school]
            ADD CONSTRAINT [FK_typeOfEstablishmentLookup_id]
                FOREIGN KEY (typeOfEstablishmentLookup_id) REFERENCES [mtc_admin].[typeOfEstablishmentLookup] (id);

