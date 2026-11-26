import { TYPES } from 'mssql'
import { type IModifyResult, type ISqlService, SqlService } from '../../sql/sql.service.js'

export class CheckStartedDataService implements ICheckStartedDataService {
  private readonly sqlService: Pick<ISqlService, 'query' | 'modify'>

  constructor (sqlService?: Pick<ISqlService, 'query' | 'modify'>) {
    this.sqlService = sqlService ?? new SqlService()
  }

  async updateCheckStartedDate (checkCode: string, checkStartedDateTime: Date): Promise<IModifyResult> {
    const sql = `UPDATE [mtc_admin].[check]
                    SET startedAt = @startedAt
                  WHERE checkCode = @checkCode
                    AND startedAt IS NULL`
    const params = [
      { name: 'startedAt', value: checkStartedDateTime, type: TYPES.DateTimeOffset },
      { name: 'checkCode', value: checkCode, type: TYPES.UniqueIdentifier }
    ]
    return this.sqlService.modify(sql, params)
  }

  async hasStarted (checkCode: string): Promise<boolean> {
    const sql = `SELECT CAST(CASE WHEN EXISTS (
                    SELECT 1 FROM [mtc_admin].[checkStartAcknowledgement] AS a
                    INNER JOIN [mtc_admin].[check] AS c ON c.[id] = a.[check_id]
                    WHERE c.[checkCode] = @checkCode
                  ) THEN 1 ELSE 0 END AS BIT) AS [hasStarted]`
    const params = [
      { name: 'checkCode', value: checkCode, type: TYPES.UniqueIdentifier }
    ]
    const results = await this.sqlService.query(sql, params)
    if (typeof results?.[0]?.hasStarted !== 'boolean') {
      throw new Error('Check start lookup returned an invalid result')
    }
    return results[0].hasStarted
  }

  async acknowledgeStart (checkCode: string, attemptId: string): Promise<boolean> {
    const sql = `
      DECLARE @xactAbortWasOn BIT = CASE WHEN (16384 & @@OPTIONS) = 16384 THEN 1 ELSE 0 END;
      SET XACT_ABORT ON;
      DECLARE @approved BIT = 0;
      BEGIN TRY
      BEGIN TRANSACTION;
      DECLARE @enabled BIT;
      SELECT @enabled = [isEnabled]
        FROM [mtc_admin].[emergencyOffSwitch] WITH (UPDLOCK, HOLDLOCK)
        WHERE [id] = 1;
      IF @enabled IS NULL
        THROW 51000, 'Emergency off-switch state row is missing.', 1;

      DECLARE @checkId INT = (SELECT [id] FROM [mtc_admin].[check] WHERE [checkCode] = @checkCode);
      IF @checkId IS NULL
        THROW 51000, 'Check not found.', 1;

      IF EXISTS (SELECT 1 FROM [mtc_admin].[checkStartAcknowledgement] WHERE [attemptId] = @attemptId AND [check_id] = @checkId)
        SET @approved = 1;
      ELSE IF @enabled = 0
      BEGIN
        INSERT INTO [mtc_admin].[checkStartAcknowledgement] ([attemptId], [check_id]) VALUES (@attemptId, @checkId);
        SET @approved = 1;
      END
      COMMIT TRANSACTION;
      END TRY
      BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        IF @xactAbortWasOn = 0 SET XACT_ABORT OFF;
        THROW;
      END CATCH;
      IF @xactAbortWasOn = 0 SET XACT_ABORT OFF;
      SELECT @approved AS [approved];`
    const results = await this.sqlService.query(sql, [
      { name: 'checkCode', value: checkCode, type: TYPES.UniqueIdentifier },
      { name: 'attemptId', value: attemptId, type: TYPES.UniqueIdentifier }
    ])
    if (typeof results?.[0]?.approved !== 'boolean') {
      throw new Error('Check start acknowledgement returned an invalid result')
    }
    return results[0].approved
  }

  async isSubmissionAllowed (checkCode: string | null, attemptId: string | null): Promise<boolean> {
    const sql = `
      SELECT CAST(CASE WHEN e.[isEnabled] = 0 OR EXISTS (
        SELECT 1 FROM [mtc_admin].[checkStartAcknowledgement] AS a
        INNER JOIN [mtc_admin].[check] AS c ON c.[id] = a.[check_id]
        WHERE c.[checkCode] = @checkCode AND a.[attemptId] = @attemptId
      ) THEN 1 ELSE 0 END AS BIT) AS [allowed]
      FROM [mtc_admin].[emergencyOffSwitch] AS e WITH (READCOMMITTEDLOCK)
      WHERE e.[id] = 1`
    const results = await this.sqlService.query(sql, [
      { name: 'checkCode', value: checkCode, type: TYPES.UniqueIdentifier },
      { name: 'attemptId', value: attemptId, type: TYPES.UniqueIdentifier }
    ])
    if (typeof results?.[0]?.allowed !== 'boolean') {
      throw new Error('Check submission eligibility returned an invalid result')
    }
    return results[0].allowed
  }

  async isLiveCheck (checkCode: string): Promise<boolean> {
    const sql = `SELECT isLiveCheck FROM [mtc_admin].[check] WHERE checkCode = @checkCode`
    const params = [
      { name: 'checkCode', value: checkCode, type: TYPES.UniqueIdentifier }
    ]
    const results = await this.sqlService.query(sql, params)
    const first = results?.[0]
    return first?.isLiveCheck === true
  }
}

export interface ICheckStartedDataService {
  updateCheckStartedDate (checkCode: string, checkStartedDateTime: Date): Promise<IModifyResult>
  hasStarted (checkCode: string): Promise<boolean>
  acknowledgeStart (checkCode: string, attemptId: string): Promise<boolean>
  isSubmissionAllowed (checkCode: string | null, attemptId: string | null): Promise<boolean>
  isLiveCheck (checkCode: string): Promise<boolean>
}
