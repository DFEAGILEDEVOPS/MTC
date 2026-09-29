-- schoolAudit had no index on school_id, forcing a full table scan on every
-- organisation-detail page load (query joins school_id then orders by id DESC).
-- This caused SQL request timeouts (ETIMEOUT) as the table grew. See PBI #68292.
CREATE NONCLUSTERED INDEX [ix_schoolAudit_school_id]
ON [mtc_admin].[schoolAudit] ([school_id], [id] DESC)
INCLUDE ([createdAt], [auditOperationTypeLookup_id], [operationBy_userId]);
