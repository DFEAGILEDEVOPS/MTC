import { ConsoleLogger, ILogger } from '../../common/logger'
import { ISqlService, SqlService } from '../../sql/sql.service'
import { TYPES } from 'mssql'

export interface ICheckResetService {
  processingFailed (checkCode: string): Promise<void>
}

export class ProcessingFailureService {
  private readonly logger: ILogger
  private readonly sqlService: ISqlService
  private readonly name = 'sync-results-to-sql: processing-failed-service'

  constructor (logger?: ILogger, sqlService?: ISqlService) {
    this.logger = logger ?? new ConsoleLogger()
    this.sqlService = sqlService ?? new SqlService()
  }

  public async processingFailed (checkCode: string): Promise<void> {
    this.logger.info(`${this.name}: called for checkCode [${checkCode}]`)
    const params = [
      { name: 'checkCode', value: checkCode, type: TYPES.UniqueIdentifier }
    ]
    /**
     * This SQL is almost but _not_ exactly the same as the code called by the markingService on the failure path at the notification
     * service.  However, in this scenario the check has already been completed and the pupil marked as checkComplete so there
     * are few fields to _undo_ as we must set the check to processing failed, and remove the check complete flag from the pupil.
     *
     * After this the pupil is immediately eligible for a restart which may be applied due to technical difficulties.  The message
     * will be dead-lettered for later analysis.
     */
    const sql = `
        DECLARE @checkId INT = (SELECT id
                                  FROM mtc_admin.[check]
                                 WHERE checkCode = @checkCode);
        DECLARE @pupilId INT;
        DECLARE @throwMsg VARCHAR(255);

        IF @checkId IS NULL
            BEGIN
                SET @throwMsg = CONCAT('Error updating check: no check found for checkCode ', @checkCode);
                THROW 51003, @throwMsg, 1;
            END

        SET @pupilId = (SELECT pupil_id
                          FROM mtc_admin.[check]
                         WHERE id = @checkId);

        UPDATE mtc_admin.[check]
           SET processingFailed = 1,
               checkStatus_id = (SELECT id FROM mtc_admin.checkStatus WHERE code = 'ERR'),
               complete = 0,
               completedAt = NULL
         WHERE id = @checkId;

        UPDATE mtc_admin.pupil
           SET checkComplete = 0
         WHERE id = @pupilId;
    `
    return this.sqlService.modifyWithTransaction([{ sql, params }])
  }
}
