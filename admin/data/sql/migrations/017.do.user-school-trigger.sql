CREATE TRIGGER user_school_id_null_check
ON [mtc_admin].[user]
FOR INSERT, UPDATE
AS
IF UPDATE(school_id)
BEGIN
      IF EXISTS (SELECT * FROM inserted i WHERE i.school_id IS NULL AND i.role_id = 3)
      BEGIN
            THROW 50000, 'Users in Teacher role must be assigned to a school', 1;
      END
END
