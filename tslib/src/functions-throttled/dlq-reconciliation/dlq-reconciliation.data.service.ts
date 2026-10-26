import { TYPES, MAX } from 'mssql'
import { SqlService, type ISqlService } from '../../sql/sql.service'
import { queueName, type ReconciliationItem, type ReconciliationMode, type ReconciliationRun } from './models'

export interface IDlqReconciliationDataService {
  isSynchronised (checkCode: string, schoolUUID: string): Promise<boolean>
}

export class DlqReconciliationDataService implements IDlqReconciliationDataService {
  constructor (private readonly sqlService: Pick<ISqlService, 'query'> = new SqlService()) {}

  async isSynchronised (checkCode: string, schoolUUID: string): Promise<boolean> {
    const rows = await this.sqlService.query(
      `SELECT c.resultsSynchronised FROM [mtc_admin].[check] c
       JOIN [mtc_admin].[pupil] p ON p.id=c.pupil_id
       JOIN [mtc_admin].[school] s ON s.id=p.school_id
       WHERE checkCode=@checkCode AND s.urlSlug=@schoolUUID`,
      [{ name: 'checkCode', type: TYPES.UniqueIdentifier, value: checkCode },
        { name: 'schoolUUID', type: TYPES.UniqueIdentifier, value: schoolUUID }]
    )
    return rows[0]?.resultsSynchronised === true || rows[0]?.resultsSynchronised === 1
  }

  async createRun (runId: string, mode: ReconciliationMode, requestedBy: string, previewRunId?: string): Promise<void> {
    await this.sqlService.query(`UPDATE mtc_admin.dlqReconciliationRun
      SET status='Interrupted', finishedAt=SYSUTCDATETIME(), message='Previous request interrupted. Review pending removals.'
      WHERE (status='Running' AND heartbeatAt<DATEADD(MINUTE,-10,SYSUTCDATETIME()))
         OR (status='Queued' AND createdAt<DATEADD(MINUTE,-10,SYSUTCDATETIME()));
      INSERT INTO mtc_admin.dlqReconciliationRun (runId, queueName, mode, requestedBy, previewRunId)
      VALUES (@runId, @queueName, @mode, @requestedBy, @previewRunId)`, [
      { name: 'runId', type: TYPES.UniqueIdentifier, value: runId },
      { name: 'queueName', type: TYPES.VarChar(64), value: queueName },
      { name: 'mode', type: TYPES.VarChar(10), value: mode },
      { name: 'requestedBy', type: TYPES.NVarChar(128), value: requestedBy },
      { name: 'previewRunId', type: TYPES.UniqueIdentifier, value: previewRunId }
    ])
  }

  async claimRun (runId: string): Promise<ReconciliationRun | undefined> {
    const rows = await this.sqlService.query(`
      UPDATE mtc_admin.dlqReconciliationRun
         SET status='Interrupted', finishedAt=SYSUTCDATETIME(), message='Worker interrupted. Pending removals require review.'
       WHERE status='Running' AND heartbeatAt<DATEADD(MINUTE,-10,SYSUTCDATETIME());
      ;WITH nextRun AS (
        SELECT TOP (1) * FROM mtc_admin.dlqReconciliationRun WITH (UPDLOCK, READPAST, ROWLOCK)
         WHERE status='Queued' AND runId=@runId ORDER BY createdAt
      )
      UPDATE nextRun SET status='Running', heartbeatAt=SYSUTCDATETIME()
      OUTPUT inserted.*;`, [{ name: 'runId', type: TYPES.UniqueIdentifier, value: runId }])
    return rows[0]
  }

  async heartbeat (runId: string): Promise<void> {
    await this.sqlService.query(`UPDATE mtc_admin.dlqReconciliationRun SET heartbeatAt=SYSUTCDATETIME()
      WHERE runId=@runId AND status='Running';
      IF @@ROWCOUNT<>1 THROW 51000, 'Reconciliation run is no longer active', 1;`, [
      { name: 'runId', type: TYPES.UniqueIdentifier, value: runId }
    ])
  }

  async recordInventory (runId: string, items: ReconciliationItem[]): Promise<void> {
    await this.sqlService.query(`INSERT INTO mtc_admin.dlqReconciliationItem
      (runId, sequenceNumber, messageId, checkCode, schoolUUID, submittedAt, outcome, checkedAt)
      SELECT @runId, sequenceNumber, messageId, checkCode, schoolUUID, submittedAt, outcome,
        CASE WHEN outcome='Pending' THEN NULL ELSE SYSUTCDATETIME() END
      FROM OPENJSON(@items) WITH (
        sequenceNumber varchar(20), messageId nvarchar(128), checkCode uniqueidentifier,
        schoolUUID uniqueidentifier, submittedAt datetime2, outcome varchar(96)
      )`, [
      { name: 'runId', type: TYPES.UniqueIdentifier, value: runId },
      { name: 'items', type: TYPES.NVarChar(MAX), value: JSON.stringify(items) }
    ])
  }

  async recordOutcome (runId: string, item: ReconciliationItem): Promise<void> {
    await this.sqlService.query(`UPDATE mtc_admin.dlqReconciliationItem SET outcome=@outcome, checkedAt=SYSUTCDATETIME()
      WHERE runId=@runId AND sequenceNumber=@sequenceNumber
        AND EXISTS (SELECT 1 FROM mtc_admin.dlqReconciliationRun WHERE runId=@runId AND status='Running');
      IF @@ROWCOUNT<>1 THROW 51000, 'Reconciliation audit item is missing', 1;`, [
      { name: 'runId', type: TYPES.UniqueIdentifier, value: runId },
      { name: 'sequenceNumber', type: TYPES.VarChar(20), value: item.sequenceNumber },
      { name: 'outcome', type: TYPES.VarChar(96), value: item.outcome }
    ])
  }

  async finishRun (runId: string, status: string, message: string, before: number | null, after: number | null): Promise<void> {
    await this.sqlService.query(`UPDATE mtc_admin.dlqReconciliationRun
      SET status=@status, message=@message, deadLetterCountBefore=@before, deadLetterCountAfter=@after,
          finishedAt=SYSUTCDATETIME(), heartbeatAt=SYSUTCDATETIME()
      WHERE runId=@runId AND status='Running'`, [
      { name: 'runId', type: TYPES.UniqueIdentifier, value: runId },
      { name: 'status', type: TYPES.VarChar(24), value: status },
      { name: 'message', type: TYPES.NVarChar(512), value: message },
      { name: 'before', type: TYPES.Int, value: before },
      { name: 'after', type: TYPES.Int, value: after }
    ])
  }

  async getRun (runId: string): Promise<ReconciliationRun | undefined> {
    const rows = await this.sqlService.query(`SELECT r.*, totals.* FROM mtc_admin.dlqReconciliationRun r
      CROSS APPLY (SELECT COUNT(*) AS inventoryCount,
        COUNT(CASE WHEN checkedAt IS NOT NULL THEN 1 END) AS checkedCount,
        COUNT(CASE WHEN outcome='Removed' THEN 1 END) AS removedCount,
        COUNT(CASE WHEN outcome='Eligible' THEN 1 END) AS eligibleCount,
        COUNT(CASE WHEN outcome LIKE 'Retained:%' THEN 1 END) AS retainedCount,
        COUNT(CASE WHEN outcome LIKE 'Failed:%' OR outcome LIKE 'Unknown:%' THEN 1 END) AS failedCount
        FROM mtc_admin.dlqReconciliationItem WHERE runId=r.runId) totals
      WHERE r.runId=@runId`, [{ name: 'runId', type: TYPES.UniqueIdentifier, value: runId }])
    return rows[0]
  }

  async getItems (runId: string, page: number): Promise<ReconciliationItem[]> {
    return this.sqlService.query(`SELECT sequenceNumber, messageId, checkCode, schoolUUID, checkedAt, submittedAt, outcome
      FROM mtc_admin.dlqReconciliationItem WHERE runId=@runId ORDER BY CAST(sequenceNumber AS decimal(20,0))
      OFFSET @offset ROWS FETCH NEXT 50 ROWS ONLY`, [
      { name: 'runId', type: TYPES.UniqueIdentifier, value: runId },
      { name: 'offset', type: TYPES.Int, value: (page - 1) * 50 }
    ])
  }

  async getInventory (runId: string): Promise<ReconciliationItem[]> {
    return this.sqlService.query(`SELECT sequenceNumber, messageId, checkCode, schoolUUID, submittedAt, outcome
      FROM mtc_admin.dlqReconciliationItem WHERE runId=@runId`, [
      { name: 'runId', type: TYPES.UniqueIdentifier, value: runId }
    ])
  }

  async listRuns (): Promise<ReconciliationRun[]> {
    return this.sqlService.query('SELECT TOP (20) * FROM mtc_admin.dlqReconciliationRun ORDER BY createdAt DESC')
  }
}