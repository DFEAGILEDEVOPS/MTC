CREATE TABLE [mtc_admin].[pupilGroup]
(
    id INT PRIMARY KEY IDENTITY,
    groupForPupil_id INT,
    createdAt DATETIMEOFFSET DEFAULT GETUTCDATE(),
    CONSTRAINT pupilGroup_groupForPupil_id_fk FOREIGN KEY (groupForPupil_id) REFERENCES [mtc_admin].[pupilGroup] (id)
)
CREATE UNIQUE INDEX checkFormWindow_checkForm_id_checkWindow_id_uindex ON mtc.mtc_admin.checkFormWindow (checkForm_id, checkWindow_id)
