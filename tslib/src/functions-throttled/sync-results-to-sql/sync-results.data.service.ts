import { TYPES } from 'mssql'
import * as R from 'ramda'
import { type Audit, type Device, type MarkedCheck, type ValidatedCheck } from './models'
import { type IPrepareAnswersAndInputsDataService, PrepareAnswersAndInputsDataService } from './prepare-answers-and-inputs.data.service'
import { type IModifyResult, type ISqlParameter, type ISqlService, type ITransactionRequest, SqlService } from '../../sql/sql.service'
import { UserAgentParser } from './user-agent-parser'
import { type IPrepareEventService, PrepareEventService } from './prepare-event.service'
import { ConsoleLogger, type ILogger } from '../../common/logger'
import { payloadSort } from '../../services/payload-sort'

const name = 'sync-results-to-sql: data service'

export interface ISyncResultsDataService {
  insertToDatabase (requests: ITransactionRequest[], checkCode: string): Promise<void>

  prepareAnswersAndInputs (markedCheck: MarkedCheck, validatedCheck: ValidatedCheck): Promise<ITransactionRequest[]>

  prepareCheckResult (markedCheck: MarkedCheck): ITransactionRequest

  prepareDeviceData (validatedCheck: ValidatedCheck): Promise<ITransactionRequest>

  prepareEvents (validatedCheck: ValidatedCheck): Promise<ITransactionRequest[]>

  getSchoolId (schoolUuid: string): Promise<number | undefined>

  deleteExistingResultIfExists (markedCheck: MarkedCheck): Promise<void>

  setCheckToResultsSyncComplete (markedCheck: MarkedCheck): Promise<IModifyResult>

  setCheckToResultsSyncFailed (markedCheck: MarkedCheck, errorMessage: string): Promise<void>
}

export class SyncResultsDataService implements ISyncResultsDataService {
  private readonly sqlService: ISqlService
  private readonly prepareAnswersAndInputsDataService: IPrepareAnswersAndInputsDataService
  private readonly prepareEventService: IPrepareEventService
  private readonly logger: ILogger

  constructor (logger?: ILogger, sqlService?: ISqlService, prepareAnswersAndInputsDataService?: IPrepareAnswersAndInputsDataService, prepareEventService?: IPrepareEventService) {
    this.logger = logger ?? new ConsoleLogger()
    this.sqlService = sqlService ?? new SqlService(this.logger)
    this.prepareAnswersAndInputsDataService = prepareAnswersAndInputsDataService ?? new PrepareAnswersAndInputsDataService()
    this.prepareEventService = prepareEventService ?? new PrepareEventService()
  }

  /**
   * set the check to successfully synchronised results
   * @param {MarkedCheck} markedCheck
   */
  public async setCheckToResultsSyncComplete (markedCheck: MarkedCheck): Promise<IModifyResult> {
    const sql = 'UPDATE [mtc_admin].[check] SET resultsSynchronised=1 WHERE checkCode=@checkCode'
    const params = new Array<ISqlParameter>()
    params.push({
      name: 'checkCode',
      value: markedCheck.checkCode,
      type: TYPES.UniqueIdentifier
    })
    return this.sqlService.modify(sql, params)
  }

  /**
   * set the check to failed results sync and log the error detail
   * @param {MarkedCheck} markedCheck
   */
  public async setCheckToResultsSyncFailed (markedCheck: MarkedCheck, errorMessage: string): Promise<void> {
    const checkSql = 'UPDATE [mtc_admin].[check] SET resultsSynchronised=0 WHERE checkCode=@checkCode'
    const checkParams = new Array<ISqlParameter>()
    checkParams.push({
      name: 'checkCode',
      value: markedCheck.checkCode,
      type: TYPES.UniqueIdentifier
    })
    const updateCheckRecord: ITransactionRequest = {
      params: checkParams,
      sql: checkSql
    }

    const checkIdQueryResult = await this.sqlService.query('SELECT id FROM [mtc_admin].[check] WHERE checkCode=@checkCode',
      [{ name: 'checkCode', value: markedCheck.checkCode, type: TYPES.UniqueIdentifier }])
    const checkId = checkIdQueryResult[0].id

    const errorLogSql = 'INSERT INTO [mtc_results].[checkResultSyncError] (check_id, errorMessage) VALUES (@checkId, @errorMessage)'
    const errorLogParams = new Array<ISqlParameter>()
    errorLogParams.push({
      name: 'checkId',
      type: TYPES.Int,
      value: checkId
    })
    errorLogParams.push({
      name: 'errorMessage',
      type: TYPES.NVarChar(),
      value: errorMessage
    })
    const insertErrorLog: ITransactionRequest = {
      params: errorLogParams,
      sql: errorLogSql
    }
    return this.sqlService.modifyWithTransaction([updateCheckRecord, insertErrorLog])
  }

  /**
   * Delete the existing check result row and associated records from the mtc_results schema
   * @param {MarkedCheck} markedCheck
   */
  public async deleteExistingResultIfExists (markedCheck: MarkedCheck): Promise<void> {
    const checkInfoParams = new Array<ISqlParameter>()
    checkInfoParams.push({
      name: 'checkCode',
      value: markedCheck.checkCode,
      type: TYPES.UniqueIdentifier
    })
    const checkResultInfoQueryResult = await this.sqlService.query(`
        SELECT cr.id as [checkResultId], cr.userDevice_id as [userDeviceId]
          FROM [mtc_results].[checkResult] cr
               INNER JOIN [mtc_admin].[check] chk ON cr.check_id = chk.id
         WHERE chk.checkCode = @checkCode`, checkInfoParams)
    const checkResultInfo = checkResultInfoQueryResult[0]
    if (checkResultInfo === undefined) return

    const checkResultIdParam: ISqlParameter = {
      name: 'checkResultId',
      type: TYPES.Int,
      value: checkResultInfo.checkResultId
    }
    const userDeviceIdParam: ISqlParameter = {
      name: 'userDeviceId',
      type: TYPES.Int,
      value: checkResultInfo.userDeviceId
    }
    const deleteUserInputs: ITransactionRequest = {
      sql: 'DELETE FROM [mtc_results].[userInput] WHERE answer_id IN (SELECT id FROM [mtc_results].[answer] WHERE checkResult_id = @checkResultId)',
      params: [checkResultIdParam]
    }
    const deleteAnswers: ITransactionRequest = {
      sql: 'DELETE FROM [mtc_results].[answer] WHERE checkResult_id = @checkResultId',
      params: [checkResultIdParam]
    }
    const deleteEvents: ITransactionRequest = {
      sql: 'DELETE FROM [mtc_results].[event] WHERE checkResult_id = @checkResultId',
      params: [checkResultIdParam]
    }
    const deleteCheckResult: ITransactionRequest = {
      sql: 'DELETE FROM [mtc_results].[checkResult] WHERE id = @checkResultId',
      params: [checkResultIdParam]
    }
    const deleteUserDevice: ITransactionRequest = {
      sql: 'DELETE FROM [mtc_results].[userDevice] WHERE id = @userDeviceId',
      params: [userDeviceIdParam]
    }
    return this.sqlService.modifyWithTransaction([
      deleteUserInputs,
      deleteAnswers,
      deleteEvents,
      deleteCheckResult,
      deleteUserDevice
    ])
  }

  /**
   * Prepare the event SQL and Parameters from the raw payload
   * @param {ValidatedCheck} validatedCheck
   */
  public async prepareEvents (validatedCheck: ValidatedCheck): Promise<ITransactionRequest[]> {
    const audits: Audit[] = R.propOr([], 'audit', validatedCheck)
    const sortedAudits = payloadSort(audits)
    const transactions: ITransactionRequest[] = []
    let auditParams = []
    let auditSqls = []
    const headSql = `
        DECLARE @checkResultId INT = (SELECT cr.id
                                        FROM mtc_results.[checkResult] cr
                                             JOIN mtc_admin.[check] c ON (cr.check_id = c.id)
                                       WHERE c.checkCode = @checkCode);

        IF (@checkResultId IS NULL) THROW 510001, 'CheckResult ID not found when preparing answers and inputs', 1
    `
    const headParam = { name: 'checkCode', value: validatedCheck.checkCode, type: TYPES.UniqueIdentifier }
    auditSqls.push(headSql)
    auditParams.push(headParam)

    let j = 0
    for (const audit of sortedAudits) {
      const transactionRequest = await this.prepareEventService.prepareEvent(audit, validatedCheck.checkCode, j)
      auditSqls.push(transactionRequest.sql)
      auditParams.push(...transactionRequest.params)
      j += 1
      if (auditParams.length > 1000) {
        transactions.push({ sql: auditSqls.join('\n'), params: R.clone(auditParams) })
        auditSqls = [headSql]
        auditParams = [headParam]
      }
    }
    // include the remainder events that did not go in the earlier transaction
    transactions.push({ sql: auditSqls.join('\n'), params: R.clone(auditParams) })
    auditSqls = []
    auditParams = []
    return transactions
  }

  public async prepareDeviceData (validatedCheck: ValidatedCheck): Promise<ITransactionRequest> {
    const device: Device = R.propOr({}, 'device', validatedCheck)
    const params = []
    let agent: UserAgentParser | undefined

    const batteryIsCharging = R.pathOr(null, ['battery', 'isCharging'], device)
    const batteryLevelPercent = R.pathOr(null, ['battery', 'levelPercent'], device)
    const batteryChargingTimeSecs = R.pathOr(null, ['battery', 'chargingTime'], device)
    const batteryDischargingTimeSecs = R.pathOr(null, ['battery', 'dischargingTime'], device)
    const cpuHardwareConcurrency = R.pathOr(null, ['cpu', 'hardwareConcurrency'], device)
    const navigatorPlatform = R.pathOr(null, ['navigator', 'platform'], device)
    const navigatorLanguage = R.pathOr(null, ['navigator', 'language'], device)
    const cookieEnabled = R.pathOr(null, ['navigator', 'cookieEnabled'], device)
    const networkConnectionDownlink = R.pathOr(null, ['networkConnection', 'downlink'], device)
    const networkConnectionEffectiveType = R.pathOr(null, ['networkConnection', 'effectiveType'], device)
    const networkConnectionRoundTripTimeMs = R.pathOr(null, ['networkConnection', 'rtt'], device)
    const screenWidth = R.pathOr(null, ['screen', 'screenWidth'], device)
    const screenHeight = R.pathOr(null, ['screen', 'screenHeight'], device)
    const outerWidth = R.pathOr(null, ['screen', 'outerWidth'], device)
    const outerHeight = R.pathOr(null, ['screen', 'outerHeight'], device)
    const innerWidth = R.pathOr(null, ['screen', 'innerWidth'], device)
    const innerHeight = R.pathOr(null, ['screen', 'innerHeight'], device)
    const colourDepth = R.pathOr(null, ['screen', 'colorDepth'], device)
    const deviceOrientation = R.pathOr(null, ['screen', 'orientation'], device)
    const appUsageCount = R.propOr(null, 'appUsageCounter', device)
    const userAgent: string | null = R.pathOr(null, ['navigator', 'userAgent'], device)
    if (userAgent !== null) {
      agent = new UserAgentParser(userAgent)
    }
    const deviceId = R.propOr(null, 'deviceId', device)

    params.push({ name: 'batteryIsCharging', type: TYPES.Bit, value: batteryIsCharging })
    params.push({ name: 'batteryLevelPercent', type: TYPES.Int, value: batteryLevelPercent })
    params.push({ name: 'batteryChargingTimeSecs', type: TYPES.BigInt, value: batteryChargingTimeSecs })
    params.push({ name: 'batteryDischargingTimeSecs', type: TYPES.BigInt, value: batteryDischargingTimeSecs })
    params.push({ name: 'cpuHardwareConcurrency', type: TYPES.Int, value: cpuHardwareConcurrency })
    params.push({ name: 'browserFamily', type: TYPES.NVarChar, value: agent !== undefined ? agent.getBrowserFamily() : null })
    params.push({ name: 'browserMajorVersion', type: TYPES.Int, value: agent !== undefined ? agent.getBrowserMajorVersion() : null })
    params.push({ name: 'browserMinorVersion', type: TYPES.Int, value: agent !== undefined ? agent.getBrowserMinorVersion() : null })
    params.push({ name: 'browserPatchVersion', type: TYPES.Int, value: agent !== undefined ? agent.getBrowserPatchVersion() : null })
    params.push({ name: 'uaOperatingSystem', type: TYPES.NVarChar, value: agent !== undefined ? agent.getOperatingSystem() : null })
    params.push({
      name: 'uaOperatingSystemMajorVersion',
      type: TYPES.Int,
      value: agent !== undefined ? agent.getOperatingSystemMajorVersion() : null
    })
    params.push({
      name: 'uaOperatingSystemMinorVersion',
      type: TYPES.Int,
      value: agent !== undefined ? agent.getOperatingSystemMinorVersion() : null
    })
    params.push({
      name: 'uaOperatingSystemPatchVersion',
      type: TYPES.Int,
      value: agent !== undefined ? agent.getOperatingSystemPatchVersion() : null
    })
    params.push({ name: 'navigatorPlatform', type: TYPES.NVarChar(255), value: navigatorPlatform })
    params.push({ name: 'navigatorLanguage', type: TYPES.NVarChar(36), value: navigatorLanguage })
    params.push({ name: 'cookieEnabled', type: TYPES.Bit, value: cookieEnabled })
    params.push({ name: 'networkConnectionDownlink', type: TYPES.Float, value: networkConnectionDownlink })
    params.push({ name: 'networkConnectionEffectiveType', type: TYPES.NVarChar(10), value: networkConnectionEffectiveType })
    params.push({ name: 'networkConnectionRoundTripTimeMs', type: TYPES.Int, value: networkConnectionRoundTripTimeMs })
    params.push({ name: 'screenWidth', type: TYPES.Int, value: screenWidth })
    params.push({ name: 'screenHeight', type: TYPES.Int, value: screenHeight })
    params.push({ name: 'outerWidth', type: TYPES.Int, value: outerWidth })
    params.push({ name: 'outerHeight', type: TYPES.Int, value: outerHeight })
    params.push({ name: 'innerWidth', type: TYPES.Int, value: innerWidth })
    params.push({ name: 'innerHeight', type: TYPES.Int, value: innerHeight })
    params.push({ name: 'colourDepth', type: TYPES.Int, value: colourDepth })
    params.push({ name: 'deviceOrientation', type: TYPES.NVarChar, value: deviceOrientation })
    params.push({ name: 'appUsageCount', type: TYPES.Int, value: appUsageCount })
    params.push({
      name: 'userAgent',
      type: TYPES.NVarChar(4000),
      // @ts-ignore eslint fails to recognise that the userAgent in the ternary condition will be a string
      value: (typeof userAgent) === 'string' ? userAgent.substr(0, 4000) : null
    })
    params.push({ name: 'ident', type: TYPES.NVarChar, value: deviceId })
    params.push({ name: 'checkCode', type: TYPES.UniqueIdentifier, value: validatedCheck.checkCode })

    const sql = `

        DECLARE @userDeviceId INT;
        DECLARE @browserFamily_lookup_id INT;
        DECLARE @uaOperatingSystemLookup_id INT;
        DECLARE @navigatorPlatformLookup_id INT;
        DECLARE @navigatorLanguageLookup_id INT;
        DECLARE @networkConnectionEffectiveTypeLookup_id INT;
        DECLARE @deviceOrientationLookup_id INT;
        DECLARE @userAgentHash VARBINARY(32);
        DECLARE @userAgentLookup_id INT;
        DECLARE @checkResultId INT;

        --
        -- See if we can find an existing id for the browser family; create a new one if not
        --
        SET @browserFamily_lookup_id = (SELECT id
                                          FROM mtc_results.browserFamilyLookup
                                         WHERE family = UPPER(TRIM(@browserFamily)));
        IF (@browserFamily_lookup_id IS NULL AND @browserFamily IS NOT NULL)
            BEGIN
                -- Create a new browser family
                INSERT INTO mtc_results.browserFamilyLookup (family) VALUES (UPPER(TRIM(@browserFamily)));
                SET @browserFamily_lookup_id = (SELECT SCOPE_IDENTITY());
            END

        --
        -- See if we can find an Operating System Lookup id, or if not, create a new one
        --
        SET @uaOperatingSystemLookup_id = (SELECT id
                                             FROM mtc_results.uaOperatingSystemLookup
                                            WHERE os = UPPER(TRIM(@uaOperatingSystem)));
        IF (@uaOperatingSystemLookup_id IS NULL AND @uaOperatingSystem IS NOT NULL)
            BEGIN
                INSERT INTO mtc_results.uaOperatingSystemLookup (os) VALUES (UPPER(TRIM(@uaOperatingSystem)));
                SET @uaOperatingSystemLookup_id = (SELECT SCOPE_IDENTITY());
            END

        --
        -- See if we can find the navigatorPlatform id, or create it if needed
        --
        SET @navigatorPlatformLookup_id = (SELECT id
                                             FROM mtc_results.navigatorPlatformLookup
                                            WHERE platform = UPPER(TRIM(@navigatorPlatform)));
        IF (@navigatorPlatformLookup_id IS NULL AND @navigatorPlatform IS NOT NULL)
            BEGIN
                INSERT INTO mtc_results.navigatorPlatformLookup (platform) VALUES (UPPER(TRIM(@navigatorPlatform)));
                SET @navigatorPlatformLookup_id = (SELECT SCOPE_IDENTITY());
            END

        --
        -- See if we can find the navigatorLanguage id, or create it if needed
        --
        SET @navigatorLanguageLookup_id = (SELECT id
                                             FROM mtc_results.navigatorLanguageLookup
                                            WHERE platformLang = UPPER(TRIM(@navigatorLanguage)));
        IF (@navigatorLanguageLookup_id IS NULL AND @navigatorLanguage IS NOT NULL)
            BEGIN
                INSERT INTO mtc_results.navigatorLanguageLookup (platformLang) VALUES (UPPER(TRIM(@navigatorLanguage)));
                SET @navigatorLanguageLookup_id = (SELECT SCOPE_IDENTITY());
            END

        --
        -- See if we can find the network connection effective type lookup, otherwise create a new entry
        --
        SET @networkConnectionEffectiveTypeLookup_id = (SELECT id
                                                          FROM mtc_results.networkConnectionEffectiveTypeLookup
                                                         WHERE effectiveType = TRIM(@networkConnectionEffectiveType));
        IF (@networkConnectionEffectiveTypeLookup_id IS NULL AND @networkConnectionEffectiveType IS NOT NULL)
            BEGIN
                INSERT INTO mtc_results.networkConnectionEffectiveTypeLookup (effectiveType) VALUES (@networkConnectionEffectiveType);
                SET @networkConnectionEffectiveTypeLookup_id = (SELECT SCOPE_IDENTITY());
            END

        --
        -- See if we can lookup the device orientation id, or create a new orientation if needed
        --
        SET @deviceOrientationLookup_id = (SELECT id
                                             FROM mtc_results.deviceOrientationLookup
                                            WHERE orientation = UPPER(TRIM(@deviceOrientation)));
        IF (@deviceOrientationLookup_id IS NULL AND @deviceOrientation IS NOT NULL)
            BEGIN
                INSERT INTO mtc_results.deviceOrientationLookup (orientation) VALUES (UPPER(TRIM(@deviceOrientation)));
                SET @deviceOrientationLookup_id = (SELECT SCOPE_IDENTITY());
            END


        --
        -- See if we have seen the user agent before, or if not create a new user agent lookup
        --
        SET @userAgentHash = HASHBYTES('SHA2_256', @userAgent);
        SET @userAgentLookup_id = (SELECT id
                                     from mtc_results.userAgentLookup
                                    WHERE userAgentHash = @userAgentHash);
        IF (@userAgentLookup_id IS NULL AND @userAgent IS NOT NULL)
            BEGIN
                INSERT INTO mtc_results.userAgentLookup (userAgent, userAgentHash) VALUES (@userAgent, @userAgentHash);
                SELECT @userAgentLookup_id = (SELECT SCOPE_IDENTITY());
            END

        --
        -- Insert the data into the userDevice table
        --
        BEGIN TRY
            INSERT INTO mtc_results.userDevice (batteryIsCharging,
                                                batteryLevelPercent,
                                                batteryChargingTimeSecs,
                                                batteryDischargingTimeSecs,
                                                cpuHardwareConcurrency,
                                                browserFamilyLookup_id,
                                                browserMajorVersion,
                                                browserMinorVersion,
                                                browserPatchVersion,
                                                uaOperatingSystemLookup_id,
                                                uaOperatingSystemMajorVersion,
                                                uaOperatingSystemMinorVersion,
                                                uaOperatingSystemPatchVersion,
                                                navigatorPlatformLookup_id,
                                                navigatorLanguageLookup_id,
                                                navigatorCookieEnabled,
                                                networkConnectionDownlink,
                                                networkConnectionEffectiveTypeLookup_id,
                                                networkConnectionRtt,
                                                screenWidth,
                                                screenHeight,
                                                outerWidth,
                                                outerHeight,
                                                innerWidth,
                                                innerHeight,
                                                colourDepth,
                                                deviceOrientationLookup_id,
                                                appUsageCount,
                                                userAgentLookup_id,
                                                ident)
            VALUES (@batteryIsCharging,
                    @batteryLevelPercent,
                    @batteryChargingTimeSecs,
                    @batteryDischargingTimeSecs,
                    @cpuHardwareConcurrency,
                    @browserFamily_lookup_id,
                    @browserMajorVersion,
                    @browserMinorVersion,
                    @browserPatchVersion,
                    @uaOperatingSystemLookup_id,
                    @uaOperatingSystemMajorVersion,
                    @uaOperatingSystemMinorVersion,
                    @uaOperatingSystemPatchVersion,
                    @navigatorPlatformLookup_id,
                    @navigatorLanguageLookup_id,
                    @cookieEnabled,
                    @networkConnectionDownlink,
                    @networkConnectionEffectiveTypeLookup_id,
                    @networkConnectionRoundTripTimeMs,
                    @screenWidth,
                    @screenHeight,
                    @outerWidth,
                    @outerHeight,
                    @innerWidth,
                    @innerHeight,
                    @colourDepth,
                    @deviceOrientationLookup_id,
                    @appUsageCount,
                    @userAgentLookup_id,
                    @ident);

            SET @userDeviceId = (SELECT SCOPE_IDENTITY());


            IF (@userDeviceId IS NOT NULL)
                BEGIN
                    SET @checkResultId = (SELECT cr.id
                                            FROM mtc_results.[checkResult] cr
                                                 JOIN mtc_admin.[check] c ON (cr.check_id = c.id)
                                           WHERE c.checkCode = @checkCode);

                    IF (@checkResultId IS NULL) THROW 510002, 'CheckResult ID not found when preparing [userDevice]', 1;
                    UPDATE mtc_results.checkResult SET userDevice_id = @userDeviceId WHERE id = @checkResultId;
                END
        END TRY BEGIN CATCH
            DECLARE @ErrorMessage NVARCHAR(4000);
            DECLARE @ErrorSeverity INT;
            DECLARE @ErrorState INT;

            SELECT @ErrorMessage = ERROR_MESSAGE(), @ErrorSeverity = ERROR_SEVERITY(), @ErrorState = ERROR_STATE();

            -- Use RAISERROR inside the CATCH block to return
            -- error information about the original error that
            -- caused execution to jump to the CATCH block.
            RAISERROR (@ErrorMessage, -- Message text.
                @ErrorSeverity, -- Severity.
                @ErrorState -- State.
                );
        END CATCH
    `
    return { sql, params }
  }

  /**
   * Generate SQL statements and parameters for later insertion to the DB.
   * @param {MarkedCheck} markedCheck
   */
  public prepareCheckResult (markedCheck: MarkedCheck): ITransactionRequest {
    const sql = `
        DECLARE @checkId Int;
        DECLARE @checkResultId Int;

        SET @checkId = (SELECT id
                          FROM mtc_admin.[check]
                         WHERE checkCode = @checkCode);
        IF (@checkId IS NULL) THROW 510001, 'Check ID not found', 1;

        INSERT INTO mtc_results.checkResult (check_id, mark, markedAt)
        VALUES (@checkId, @mark, @markedAt);
    `
    const params = [
      { name: 'checkCode', value: markedCheck.checkCode, type: TYPES.UniqueIdentifier },
      { name: 'mark', value: markedCheck.mark, type: TYPES.TinyInt },
      { name: 'markedAt', value: markedCheck.markedAt, type: TYPES.DateTimeOffset }
    ]
    const req: ITransactionRequest = { sql, params }
    return req
  }

  public async prepareAnswersAndInputs (markedCheck: MarkedCheck, validatedCheck: ValidatedCheck): Promise<ITransactionRequest[]> {
    return this.prepareAnswersAndInputsDataService.prepareAnswersAndInputs(markedCheck, validatedCheck)
  }

  /**
   * Persist the data in the SQL database
   * All SQL statements already prepared are sent in a single transaction.
   * @param requests
   */
  public async insertToDatabase (requests: ITransactionRequest[], checkCode: string): Promise<void> {
    try {
      requests.forEach((req, i) => {
        this.logger.info(`${name}: Request ${i} ${checkCode} sql length is ${req.sql.length} and there are ${req.params.length} parameters`)
      })
      await this.sqlService.modifyWithTransaction(requests)
    } catch (error) {
      const message = `${name}: ERROR: Failed to insert transaction to the database for checkCode [${checkCode}]`
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      this.logger.error(`${message}\nOriginal Error: ${errorMessage}`)
      // re-throw the original error
      throw error
    }
  }

  /**
   * Fetch the DB ID for a school from the UUID
   * @param {string} schoolUuid
   * @return {number}
   */
  public async getSchoolId (schoolUuid: string): Promise<number | undefined> {
    const sql = 'SELECT id FROM mtc_admin.school WHERE urlslug = @urlSlug'
    const param = { name: 'urlSlug', value: schoolUuid, type: TYPES.UniqueIdentifier }
    const data: Array<{ id: number }> = await this.sqlService.query(sql, [param])
    const school = R.head(data)
    if (school === undefined) {
      return undefined
    }
    return school.id
  }
}
