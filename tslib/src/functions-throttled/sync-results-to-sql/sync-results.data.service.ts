import { ISqlService, ITransactionRequest, SqlService } from '../../sql/sql.service'
import { Audit, DBEventType, DBQuestion, MarkedCheck, ValidatedCheck } from './models'
import { NVarChar, TYPES } from 'mssql'
import * as R from 'ramda'

export interface ISyncResultsDataService {
  insertToDatabase (requests: ITransactionRequest[]): Promise<void>

  prepareAnswers (markedheck: MarkedCheck, questionHash: Map<string, DBQuestion>): ITransactionRequest

  prepareCheckResult (markedCheck: MarkedCheck): ITransactionRequest

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
                              @questionNumber${j})`)
      j += 1
    }
    return { sql: auditSqls.join('\n'), params: auditParams }
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
    // console.log('call insertToDatabase with', requests)
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

  private findQuestion (question: string): DBQuestion {
    if (!this.questionData.has(question)) {
      throw new Error(`Unable to find question: ${question}`)
    }
    return this.questionData.get(question)!
  }
}
