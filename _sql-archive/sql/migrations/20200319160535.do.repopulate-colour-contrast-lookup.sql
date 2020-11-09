IF NOT EXISTS(SELECT id
                FROM mtc_admin.pupilColourContrasts
               WHERE code = 'BOW')
    BEGIN
        INSERT INTO [mtc_admin].[pupilColourContrasts] (displayOrder, description, code)
        VALUES (1, 'Black on White', 'BOW');
    END

IF NOT EXISTS(SELECT id
                FROM mtc_admin.pupilColourContrasts
               WHERE code = 'YOB')
    BEGIN
        INSERT INTO [mtc_admin].[pupilColourContrasts] (displayOrder, description, code)
        VALUES (2, 'Yellow on Black', 'YOB');
    END

IF NOT EXISTS(SELECT id
                FROM mtc_admin.pupilColourContrasts
               WHERE code = 'BOB')
    BEGIN
        INSERT INTO [mtc_admin].[pupilColourContrasts] (displayOrder, description, code)
        VALUES (3, 'Black on Blue', 'BOB');
    END

IF NOT EXISTS(SELECT id
                FROM mtc_admin.pupilColourContrasts
               WHERE code = 'BOP')
    BEGIN
        INSERT INTO [mtc_admin].[pupilColourContrasts] (displayOrder, description, code)
        VALUES (4, 'Black on Peach', 'BOP');
    END

IF NOT EXISTS(SELECT id
                FROM mtc_admin.pupilColourContrasts
               WHERE code = 'BOC')
    BEGIN
        INSERT INTO [mtc_admin].[pupilColourContrasts] (displayOrder, description, code)
        VALUES (5, 'Blue on Cream', 'BOC');
    END
