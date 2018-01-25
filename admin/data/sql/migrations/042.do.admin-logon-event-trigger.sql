CREATE TRIGGER adminLogonEvent_user_id_check
ON [mtc_admin].[adminLogonEvent]
FOR INSERT, UPDATE
AS
IF UPDATE(isAuthenticated)
BEGIN
      IF EXISTS (SELECT user_id FROM inserted i WHERE i.user_id IS NULL AND i.isAuthenticated = 1)
      BEGIN
            THROW 50000, 'user_id is required when authenticated', 1;
      END
END