import { ISqlService, ITransactionRequest, SqlService } from '../../sql/sql.service'
import { Audit, DBEventType, DBQuestion, Device, MarkedCheck, ValidatedCheck } from './models'
import { NVarChar, TYPES } from 'mssql'
import * as R from 'ramda'
import { UserAgentParser } from './user-agent-parser'

export interface ISyncResultsDataService {
  insertToDatabase (requests: ITransactionRequest[]): Promise<void>

  prepareAnswers (markedheck: MarkedCheck, questionHash: Map<string, DBQuestion>): ITransactionRequest

  prepareCheckResult (markedCheck: MarkedCheck): ITransactionRequest

  prepareDeviceData (validatedCheck: ValidatedCheck): Promise<ITransactionRequest>

  prepareEvents (validatedCheck: ValidatedCheck): Promise<ITransactionRequest>

  sqlGetQuestionData (): Promise<Map<string, DBQuestion>>
}

export class SyncResultsDataService implements ISyncResultsDataService {
  private sqlService: ISqlService
  private eventType: Map<string, DBEventType> = new Map()
  private questionData: Map<string, DBQuestion> = new Map()

  constructor (sqlService?: ISqlService) {
    if (!sqlService) {
      this.sqlService = new SqlService()
    } else {
      this.sqlService = sqlService
    }
  }

  /**
   * Retrieve the SQL question data and returns it in a Map indexed by the question e.g. '1x2'
   */
  public async sqlGetQuestionData (): Promise<Map<string, DBQuestion>> {
    if (this.questionData.size > 0) {
      return this.questionData
    }
    const sql = 'SELECT id, factor1, factor2, code, isWarmup FROM mtc_admin.question'
    const data: DBQuestion[] = await this.sqlService.query(sql)
    const map = new Map<string, DBQuestion>()
    data.forEach(o => {
      if (o.isWarmup === false) {
        map.set(`${o.factor1}x${o.factor2}`, Object.freeze(o))
      }
    })
    this.questionData = map
    return map
  }

  /**
   * Prepare the event SQL and Parameters from the raw payload
   * @param {ValidatedCheck} validatedCheck
   */
  public async prepareEvents (validatedCheck: ValidatedCheck): Promise<ITransactionRequest> {
    const audits: Audit[] = R.propOr([], 'audit', validatedCheck)
    const auditParams = []
    const auditSqls = []
    let question: DBQuestion | undefined
    // make sure this.questionData is populated
    await this.sqlGetQuestionData()

    let j = 0
    for (const audit of audits) {
      const eventTypeId = await this.findEventTypeId(audit.type)
      let questionId = null
      let questionNumber = null
      let eventData: string | null = null

      if (audit.data) {
        eventData = JSON.stringify(audit.data)
        if (audit.data.question && audit.data.sequenceNumber) {
          question = this.findQuestion(audit.data.question)
          questionId = question.id
          questionNumber = audit.data.sequenceNumber
        }
      }
      auditParams.push({ name: `eventTypeLookupId${j}`, type: TYPES.Int, value: eventTypeId })
      auditParams.push({ name: `browserTimestamp${j}`, type: TYPES.DateTimeOffset, value: audit.clientTimestamp })
      auditParams.push({ name: `eventData${j}`, type: TYPES.NVarChar, value: eventData })
      auditParams.push({ name: `questionId${j}`, type: TYPES.Int, value: questionId })
      auditParams.push({ name: `questionNumber${j}`, type: TYPES.SmallInt, value: questionNumber })

      auditSqls.push(`INSERT INTO mtc_results.[event] (checkResult_id,
                                 eventTypeLookup_id,
                                 browserTimestamp,
                                 eventData,
                                 question_id,
                                 questionNumber)
                      VALUES (@checkResultId,
                              @eventTypeLookupId${j},
                              @browserTimestamp${j},
                              @eventData${j},
                              @questionId${j},
                              @questionNumber${j});`)
      j += 1
    }
    return { sql: auditSqls.join('\n'), params: auditParams }
  }

  public async prepareDeviceData (validatedCheck: ValidatedCheck): Promise<ITransactionRequest> {
    const device: Device = R.propOr({}, 'device', validatedCheck)
    const params = []
    let agent: UserAgentParser | undefined = undefined

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

    // Parse the user-agent
    const userAgent = R.pathOr(null, ['navigator', 'userAgent'], device)
    if (userAgent) {
      agent = new UserAgentParser(userAgent)
    }

    params.push({ name: 'batteryIsCharging', type: TYPES.Bit, value: batteryIsCharging })
    params.push({ name: 'batteryLevelPercent', type: TYPES.TinyInt, value: batteryLevelPercent })
    params.push({ name: 'batteryChargingTimeSecs', type: TYPES.Int, value: batteryChargingTimeSecs })
    params.push({ name: 'batteryDischargingTimeSecs', type: TYPES.Int, value: batteryDischargingTimeSecs })
    params.push({ name: 'cpuHardwareConcurrency', type: TYPES.TinyInt, value: cpuHardwareConcurrency })
    params.push({ name: 'browserFamily', type: TYPES.NVarChar, value: agent ? agent.getBrowserFamily() : null })
    params.push({ name: 'browserMajorVersion', type: TYPES.Int, value: agent ? agent.getBrowserMajorVersion() : null })
    params.push({ name: 'browserMinorVersion', type: TYPES.Int, value: agent ? agent.getBrowserMinorVersion() : null })
    params.push({ name: 'browserPatchVersion', type: TYPES.Int, value: agent ? agent.getBrowserPatchVersion() : null })
    params.push({ name: 'uaOperatingSystem', type: TYPES.NVarChar, value: agent ? agent.getOperatingSystem() : null })
    params.push({ name: 'uaOperatingSystemMajorVersion', type: TYPES.Int, value: agent ? agent.getOperatingSystemMajorVersion() : null })
    params.push({ name: 'uaOperatingSystemMinorVersion', type: TYPES.Int, value: agent ? agent.getOperatingSystemMinorVersion() : null })
    params.push({ name: 'uaOperatingSystemPatchVersion', type: TYPES.Int, value: agent ? agent.getOperatingSystemPatchVersion() : null })
    params.push({ name: 'navigatorPlatform', type: TYPES.NVarChar(255), value: navigatorPlatform })
    params.push({ name: 'navigatorLanguage', type: TYPES.NVarChar(36), value: navigatorLanguage })
    params.push({ name: 'cookieEnabled', type: TYPES.Bit, value: cookieEnabled })
    params.push({ name: 'networkConnectionDownlink', type: TYPES.Float, value: networkConnectionDownlink })
    params.push({ name: 'networkConnectionEffectiveType', type: TYPES.NVarChar(10), value: networkConnectionEffectiveType })

    // tslint:disable:no-trailing-whitespace
    const sql = `

        DECLARE @userDeviceId INT;
        DECLARE @browserFamily_lookup_id INT;
        DECLARE @uaOperatingSystemLookup_id INT;
        DECLARE @navigatorPlatformLookup_id INT;
        DECLARE @navigatorLanguageLookup_id INT;
        DECLARE @networkConnectionEffectiveTypeLookup_id INT;
                
        -- 
        -- See if we can find an existing id for the browser family; create a new one if not
        --
        SET @browserFamily_lookup_id = (SELECT id FROM mtc_results.browserFamilyLookup WHERE family = UPPER(TRIM(@browserFamily)));
        IF (@browserFamily_lookup_id IS NULL AND @browserFamily IS NOT NULL)
            BEGIN
               -- Create a new browser family
                INSERT INTO mtc_results.browserFamilyLookup (family) VALUES (UPPER(TRIM(@browserFamily)));
                SET @browserFamily_lookup_id = (SELECT SCOPE_IDENTITY());
            END                
                
        -- 
        -- See if we can find an Operating System Lookup id, or if not, create a new one
        -- 
        SET @uaOperatingSystemLookup_id = (SELECT id FROM mtc_results.uaOperatingSystemLookup WHERE os = UPPER(TRIM(@uaOperatingSystem)));
        IF (@uaOperatingSystemLookup_id IS NULL AND @uaOperatingSystem IS NOT NULL)
            BEGIN
                INSERT INTO mtc_results.uaOperatingSystemLookup (os) VALUES (UPPER(TRIM(@uaOperatingSystem)));
                SET @uaOperatingSystemLookup_id = (SELECT SCOPE_IDENTITY());                
            END
                
        -- 
        -- See if we can find the navigatorPlatform id, or create it if needed
        -- 
        SET @navigatorPlatformLookup_id = (SELECT id FROM mtc_results.navigatorPlatformLookup WHERE platform = UPPER(TRIM(@navigatorPlatform)));
        IF (@navigatorPlatformLookup_id IS NULL AND @navigatorPlatform IS NOT NULL)
            BEGIN
                INSERT INTO mtc_results.navigatorPlatformLookup (platform) VALUES (UPPER(TRIM(@navigatorPlatform)));
                SET @navigatorPlatformLookup_id = (SELECT SCOPE_IDENTITY());
            END
        
        -- 
        -- See if we can find the navigatorLanguage id, or create it if needed
        -- 
        SET @navigatorLanguageLookup_id = (SELECT id FROM mtc_results.navigatorLanguageLookup WHERE platformLang = UPPER(TRIM(@navigatorLanguage)));
        IF (@navigatorLanguageLookup_id IS NULL AND @navigatorLanguage IS NOT NULL)
            BEGIN
                INSERT INTO mtc_results.navigatorLanguageLookup (platformLang) VALUES (UPPER(TRIM(@navigatorLanguage)));
                SET @navigatorLanguageLookup_id = (SELECT SCOPE_IDENTITY());
            END
        
        -- 
        -- See if we can find the network connection effective type lookup, otherwise create a new entry
        -- 
        SET @networkConnectionEffectiveTypeLookup_id = (SELECT id FROM mtc_results.networkConnectionEffectiveTypeLookup WHERE effectiveType = TRIM(@networkConnectionEffectiveType));
        IF (@networkConnectionEffectiveTypeLookup_id IS NULL AND @networkConnectionEffectiveType IS NOT NULL)
            BEGIN
                INSERT INTO mtc_results.networkConnectionEffectiveTypeLookup (effectiveType) VALUES (@networkConnectionEffectiveType);
                SET @networkConnectionEffectiveTypeLookup_id = (SELECT SCOPE_IDENTITY());
            END
        
        --
        -- Insert the data into the userDevice table
        --
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
                                            networkConnectionEffectiveTypeLookup_id)
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
                @networkConnectionEffectiveTypeLookup_id);

        SET @userDeviceId = (SELECT SCOPE_IDENTITY());

        UPDATE mtc_results.checkResult
           SET userDevice_id = @userDeviceId
         WHERE id = @checkResultId;
    `
    // tslint:enable:no-trailing-whitespace
    return { sql, params: params }
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

        SET @checkResultId = (SELECT SCOPE_IDENTITY());
    `
    const params = [
      { name: 'checkCode', value: markedCheck.checkCode, type: TYPES.UniqueIdentifier },
      { name: 'mark', value: markedCheck.mark, type: TYPES.TinyInt },
      { name: 'markedAt', value: markedCheck.markedAt, type: TYPES.DateTimeOffset }
    ]
    return { sql, params } as ITransactionRequest
  }

  /**
   * Generate SQL statements and parameters for later insertion to the DB.
   * @param {MarkedCheck} markedCheck
   * @param {Map<string, DBQuestion>} questionHash
   */
  public prepareAnswers (markedCheck: MarkedCheck, questionHash: Map<string, DBQuestion>): ITransactionRequest {
    const answerSql = markedCheck.markedAnswers.map((o, j) => {
      return `INSERT INTO mtc_results.[answer] (checkResult_id, questionNumber, answer,  question_id, isCorrect, browserTimestamp) VALUES
                  (@checkResultId, @answerQuestionNumber${j}, @answer${j},  @answerQuestionId${j}, @answerIsCorrect${j}, @answerBrowserTimestamp${j});`
    })

    const params = markedCheck.markedAnswers.map((o, j) => {
      const question = questionHash.get(o.question)
      if (!question) {
        throw new Error(`Unable to find valid question for [${o.question}] from checkCode [${markedCheck.checkCode}]`)
      }
      return [
        { name: `answerQuestionNumber${j}`, value: o.sequenceNumber, type: TYPES.SmallInt },
        { name: `answer${j}`, value: o.answer, type: TYPES.NVarChar },
        { name: `answerQuestionId${j}`, value: question.id, type: TYPES.Int },
        { name: `answerIsCorrect${j}`, value: o.isCorrect, type: TYPES.Bit },
        { name: `answerBrowserTimestamp${j}`, value: o.clientTimestamp, type: TYPES.DateTimeOffset }
      ]
    })

    return { sql: answerSql.join('\n'), params: R.flatten(params) }
  }

  /**
   * Persist the data in the SQL database
   * All SQL statements already prepared are sent in a single transaction.
   * @param requests
   */
  public async insertToDatabase (requests: ITransactionRequest[]): Promise<void> {
    return this.sqlService.modifyWithTransaction(requests)
  }

  /**
   * Cache the database event types as a side effect.
   */
  private async refreshEventTypes () {
    const sql = 'SELECT id, eventType, eventDescription FROM mtc_results.eventTypeLookup'
    const data: DBEventType[] = await this.sqlService.query(sql)
    data.forEach(o => {
      if (!this.eventType.has(o.eventType)) {
        this.eventType.set(o.eventType, o)
      }
    })
  }

  /**
   * Find an event in the event cache, or create a new event if it is not found
   * @param {string} eventTypeToFind
   * @private
   */
  private async findEventTypeId (eventTypeToFind: string): Promise<Number> {
    if (this.eventType.size === 0) {
      await this.refreshEventTypes()
    }
    if (!this.eventType.has(eventTypeToFind)) {
      // we have found a new event type
      await this.createNewEventType(eventTypeToFind)
      await this.refreshEventTypes()
    }
    const evnt = this.eventType.get(eventTypeToFind)
    if (!evnt) {
      throw new Error(`Failed to find event ${eventTypeToFind}`)
    }
    return evnt.id
  }

  /**
   * Create a new event type dynamically
   *
   * @param eventType
   */
  private async createNewEventType (eventType: string) {
    const sql = `
        INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription)
        VALUES (@eventType, @eventDescription)
    `
    const date = new Date()
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}`
    const descr = `Dynamically created on ${dateStr}`
    const params = [
      { name: 'eventType', type: NVarChar(255), value: eventType.trim() },
      { name: 'eventDescription', type: NVarChar(), value: descr }
    ]
    await this.sqlService.modify(sql, params)
  }

  /**
   * Find a question from the database given a string representing the question, like '1x2'
   * Useful for creating the FKs to the question.  Uses the questionData cache.
   * @param question
   * @private
   */
  private findQuestion (question: string): DBQuestion {
    if (!this.questionData.has(question)) {
      throw new Error(`Unable to find question: ${question}`)
    }
    return this.questionData.get(question)!
  }
}
