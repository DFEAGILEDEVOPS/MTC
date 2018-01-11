CREATE TABLE [mtc_admin].[checkFormWindow]
(
    id INT PRIMARY KEY IDENTITY,
    checkForm_id INT,
    checkWindow_id INT,
    createdAt DATETIMEOFFSET DEFAULT GETUTCDATE(),
    CONSTRAINT checkFormWindow_checkForm_id_fk FOREIGN KEY (checkForm_id) REFERENCES [mtc_admin].[checkForm] (id),
    CONSTRAINT checkFormWindow_checkWindow_id_fk FOREIGN KEY (checkWindow_id) REFERENCES [mtc_admin].[checkWindow] (id)
)
CREATE UNIQUE INDEX checkFormWindow_checkForm_id_checkWindow_id_uindex ON mtc.mtc_admin.checkFormWindow (checkForm_id, checkWindow_id)
