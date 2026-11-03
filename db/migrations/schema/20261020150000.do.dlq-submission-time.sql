IF COL_LENGTH('mtc_admin.dlqReconciliationItem', 'submittedAt') IS NULL
BEGIN
  ALTER TABLE mtc_admin.dlqReconciliationItem ADD submittedAt datetime2 NULL;
END;