UPDATE mtc_admin.pupil SET
    foreName=CAST(NEWID() AS VARCHAR(255)),
    middleNames=CAST(NEWID() AS VARCHAR(255)),
    lastName=CAST(NEWID() AS VARCHAR(255)),
    foreNameAlias=NULL,
    lastNameAlias=NULL,
    dateOfBirth=DATEADD(YEAR, -10, GETDATE()),
    upn=LEFT(REPLACE(CAST(NEWID() AS VARCHAR(255)), '-', ''), 13)
