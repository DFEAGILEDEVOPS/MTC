IF COL_LENGTH('mtc_admin.dlqReconciliationItem', 'submittedAt') IS NOT NULL
BEGIN
  ALTER TABLE mtc_admin.dlqReconciliationItem DROP COLUMN submittedAt;
END;