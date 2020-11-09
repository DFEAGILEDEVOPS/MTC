IF NOT EXISTS(SELECT id
                FROM mtc_admin.pupilFontSizes
               WHERE code = 'VSM')
    BEGIN
        INSERT INTO [mtc_admin].[pupilFontSizes] (displayOrder, description, code) VALUES (1, 'Very small', 'VSM');
    END

IF NOT EXISTS(SELECT id
                FROM mtc_admin.pupilFontSizes
               WHERE code = 'SML')
    BEGIN
        INSERT INTO [mtc_admin].[pupilFontSizes] (displayOrder, description, code) VALUES (2, 'Small', 'SML');
    END

IF NOT EXISTS(SELECT id
                FROM mtc_admin.pupilFontSizes
               WHERE code = 'RGL')
    BEGIN
        INSERT INTO [mtc_admin].[pupilFontSizes] (displayOrder, description, code) VALUES (3, 'Regular', 'RGL');
    END

IF NOT EXISTS(SELECT id
                FROM mtc_admin.pupilFontSizes
               WHERE code = 'LRG')
    BEGIN
        INSERT INTO [mtc_admin].[pupilFontSizes] (displayOrder, description, code) VALUES (4, 'Large', 'LRG');
    END

IF NOT EXISTS(SELECT id
                FROM mtc_admin.pupilFontSizes
               WHERE code = 'XLG')
    BEGIN
        INSERT INTO [mtc_admin].[pupilFontSizes] (displayOrder, description, code) VALUES (5, 'Very large', 'XLG');
    END

IF NOT EXISTS(SELECT id
                FROM mtc_admin.pupilFontSizes
               WHERE code = 'XXL')
    BEGIN
        INSERT INTO [mtc_admin].[pupilFontSizes] (displayOrder, description, code) VALUES (6, 'Largest', 'XXL');
    END
