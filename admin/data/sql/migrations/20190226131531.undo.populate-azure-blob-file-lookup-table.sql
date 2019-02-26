DELETE FROM [mtc_admin].[azureBlobFile] WHERE azureBlobFileType_id = (SELECT id FROM [mtc_admin].[azureBlobFileType] where code = 'PSR');
DELETE FROM [mtc_admin].[azureBlobFileType] WHERE code = 'PSR';
