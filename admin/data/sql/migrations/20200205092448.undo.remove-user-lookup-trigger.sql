
IF NOT EXISTS (select * from sys.objects where type = 'TR' and name = 'Insert_WithdrawalCodes')
BEGIN
  CREATE TRIGGER [mtc_admin].[adminLogonEventUpdatedAtTrigger]
  ON [mtc_admin].[adminLogonEvent]
  FOR UPDATE
  AS
  BEGIN
      UPDATE [mtc_admin].[adminLogonEvent]
      SET updatedAt = GETUTCDATE()
      FROM inserted
      WHERE [adminLogonEvent].id = inserted.id
  END

