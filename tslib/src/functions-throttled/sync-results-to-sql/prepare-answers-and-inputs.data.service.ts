import { DBQuestion, Input, MarkedAnswer, MarkedCheck, ValidatedCheck } from './models'
import { ISqlParameter, ITransactionRequest, SqlService } from '../../sql/sql.service'
import * as R from 'ramda'
import { TYPES } from 'mssql'

export interface UserInputTypeLookup {
  id: number
  code: string
  name: string
}

export interface IPrepareAnswersAndInputsDataService {
  prepareAnswersAndInputs (markedCheck: MarkedCheck, validatedCheck: ValidatedCheck, questionHash: Map<string, DBQuestion>): Promise<ITransactionRequest>
}

export class PrepareAnswersAndInputsDataService {
  private readonly cache: Map<string, number> = new Map()
  private readonly sqlService: SqlService
  private initialised = false

  constructor (sqlService?: SqlService) {
    this.sqlService = sqlService ?? new SqlService()
  }

  private async cacheUserInputTypeLookupData (): Promise<void> {
    const sql = 'SELECT id, name, code FROM mtc_results.userInputTypeLookup'
    const res: UserInputTypeLookup[] = await this.sqlService.query(sql)
    this.cache.clear()
    res.forEach(row => {
      this.cache.set(row.code, row.id)
    })
    this.initialised = true
  }

  /**
   * Find the database FK for a particular input type: mouse, touch, pen, keyboard, unknown
   * The parameter EventType has been produced from the pupil-spa {@link https://github.com/DFEAGILEDEVOPS/MTC/blob/master/pupil-spa/src/app/practice-question/practice-question.component.ts|EventType}
   * class.
   * @param eventType
   * @private
   */
  private async getUserInputLookupTypeId (eventType: string): Promise<number | undefined> {
    if (!this.initialised) {
      await this.cacheUserInputTypeLookupData()
    }

    switch (eventType) {
      case 'mouse':
        return this.cache.get('M')
      case 'touch':
        return this.cache.get('T')
      case 'pen':
        return this.cache.get('P')
      case 'keyboard':
        return this.cache.get('K')
      case 'unknown':
      default:
        return this.cache.get('U')
    }
  }

  /**
   * Generate SQL statements to insert the inputs captured during the check to the DB.
   * @param {ValidatedCheck} validatedCheck
   * @param {Map<string, DBQuestion>} questionHash
   * @params answerId E.g. '@answerId1' - the SQL parameterName for the answerId that was already set when preparing the answers
   */
  public async prepareInputs (rawInputs: Input[], question: DBQuestion, answerId: string): Promise<ITransactionRequest> {
    const params: ISqlParameter[] = []
    const sqls: string[] = []
    let j = 0
    for (const o of rawInputs) {
      const suffix = `${question.id}${j}`
      params.push(
        { name: `userInputQuestionId${suffix}`, value: question.id, type: TYPES.SmallInt },
        { name: `userInput${suffix}`, value: o.input, type: TYPES.NVarChar(40) },
        { name: `userInputTypeLookupId${suffix}`, value: await this.getUserInputLookupTypeId(o.eventType), type: TYPES.NVarChar(40) },
        { name: `userInputBrowserTimestamp${suffix}`, value: o.clientTimestamp, type: TYPES.DateTimeOffset }
      )
      sqls.push(`INSERT INTO mtc_results.[userInput] (answer_id, userInput, userInputTypeLookup_id, browserTimestamp)
                 VALUES (${answerId}, @userInput${suffix}, @userInputTypeLookupId${suffix}, @userInputBrowserTimestamp${suffix});`)
      j = j + 1
    }
    return { sql: sqls.join('\n'), params }
  }

  /**
   * Prepare SQL insert statements for the answers as well as the inputs that make up the answers.
   * @param {MarkedCheck} markedCheck
   * @param {ValidatedCheck} validatedCheck
   * @param {Map<string, DBQuestion>} questionHash
   */
  public async prepareAnswersAndInputs (markedCheck: MarkedCheck, validatedCheck: ValidatedCheck, questionHash: Map<string, DBQuestion>): Promise<ITransactionRequest> {
    const rawInputs: Input[] = R.propOr([], 'inputs', validatedCheck)
    const markedAnswers: MarkedAnswer[] = R.propOr([], 'markedAnswers', markedCheck)

    const sqls: string[] = []
    const params: ISqlParameter[] = []
    let j = 0

    for (const markedAnswer of markedAnswers) {
      const question = questionHash.get(markedAnswer.question)
      if (question === undefined) {
        throw new Error(`Unable to find valid question for [${markedAnswer.question}] from checkCode [${markedCheck.checkCode}]`)
      }
      const suffix = `${j}`
      sqls.push(`DECLARE @answerId${suffix} INT;
                 INSERT INTO mtc_results.[answer] (checkResult_id, questionNumber, answer,  question_id, isCorrect, browserTimestamp) VALUES
                   (@checkResultId, @answerQuestionNumber${suffix}, @answer${suffix},  @answerQuestionId${suffix}, @answerIsCorrect${suffix}, @answerBrowserTimestamp${suffix});
                 SET @answerId${suffix} = (SELECT SCOPE_IDENTITY()); 
                `)
      params.push(
        { name: `answerQuestionNumber${suffix}`, value: markedAnswer.sequenceNumber, type: TYPES.SmallInt },
        { name: `answer${suffix}`, value: markedAnswer.answer, type: TYPES.NVarChar },
        { name: `answerQuestionId${suffix}`, value: question.id, type: TYPES.Int },
        { name: `answerIsCorrect${suffix}`, value: markedAnswer.isCorrect, type: TYPES.Bit },
        { name: `answerBrowserTimestamp${suffix}`, value: markedAnswer.clientTimestamp, type: TYPES.DateTimeOffset })
      const inputsForThisQuestion = rawInputs.filter(o => o.question === markedAnswer.question)
      const { sql: inputSql, params: inputParams } = await this.prepareInputs(inputsForThisQuestion, question, `@answerId${suffix}`)

      sqls.push(inputSql)
      params.push(...inputParams)
      j = j + 1
    }
    return { sql: sqls.join('\n'), params }
  }
}
