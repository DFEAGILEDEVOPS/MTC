CREATE TRIGGER mtc_admin.audit_pupilLogonEvent ON [mtc_admin].[pupilLogonEvent] FOR UPDATE, INSERT, DELETE
AS
  BEGIN
    DECLARE @json nvarchar(max)
    DECLARE @table nvarchar(255) = 'pupilLogonEvent'
    DECLARE @operation varchar(50)='';
    IF EXISTS (SELECT * FROM inserted) and  EXISTS (SELECT * FROM deleted)
      BEGIN
        SELECT @operation = 'UPDATE'
        SELECT @json = (SELECT * FROM inserted FOR JSON PATH, ROOT('pupilLogonEvent'))
      END
    ELSE IF EXISTS(SELECT * FROM inserted)
      BEGIN
        SELECT @operation = 'INSERT'
        SELECT @json = (SELECT * FROM inserted FOR JSON PATH, ROOT('pupilLogonEvent'))
      END
    ElSE IF EXISTS(SELECT * FROM deleted)
      BEGIN
        SELECT @operation = 'DELETE'
        SELECT @json = (SELECT * FROM deleted FOR JSON PATH, ROOT('pupilLogonEvent'))
      END
    ELSE
      RETURN

    INSERT INTO mtc_admin.auditLog (rowData, tableName, operation) VALUES (@json, 'pupilLogonEvent', @operation)
  END;
