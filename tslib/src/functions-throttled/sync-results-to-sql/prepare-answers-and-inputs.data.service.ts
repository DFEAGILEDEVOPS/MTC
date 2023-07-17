import { type DBQuestion, type Input, type MarkedAnswer, type MarkedCheck, type ValidatedCheck, type Answer, type Audit } from './models'
import { type ISqlParameter, type ITransactionRequest } from '../../sql/sql.service'
import * as R from 'ramda'
import { TYPES } from 'mssql'
import { type IQuestionService, QuestionService } from './question.service'
import { type IUserInputService, UserInputService } from './user-input.service'
import { payloadSort } from '../../services/payload-sort'
import moment from 'moment'

export interface UserInputTypeLookup {
  id: number
  code: string
  name: string
}

export interface IPrepareAnswersAndInputsDataService {
  prepareAnswersAndInputs (markedCheck: MarkedCheck, validatedCheck: ValidatedCheck): Promise<ITransactionRequest[]>
}

export class PrepareAnswersAndInputsDataService {
  private readonly questionService: IQuestionService
  private readonly userInputService: IUserInputService

  constructor (questionService?: IQuestionService, userInputService?: IUserInputService) {
    this.questionService = questionService ?? new QuestionService()
    this.userInputService = userInputService ?? new UserInputService()
  }

  private questionWasAnsweredMoreThanOnce (answers: Answer[], markedAnswer: MarkedAnswer): boolean {
    const isMatch = (answer: Answer): boolean => answer.sequenceNumber === markedAnswer.sequenceNumber &&
      answer.factor1 === markedAnswer.factor1 &&
      answer.factor2 === markedAnswer.factor2
    const count = R.count(isMatch, answers)
    return count > 1
  }

  private sortEvents (events: Audit[]): Audit[] {
    const comparator = (a: Audit, b: Audit): number => {
      const aDate = new Date(a.clientTimestamp)
      const bDate = new Date(b.clientTimestamp)
      if (aDate < bDate) {
        return -1
      } else if (aDate.getTime() === bDate.getTime()) {
        if (a?.data?.monotonicTime?.sequenceNumber !== undefined && b?.data?.monotonicTime?.sequenceNumber !== undefined) {
          return a?.data?.monotonicTime?.sequenceNumber - b?.data?.monotonicTime?.sequenceNumber
        } else {
          return 0
        }
      }
      return 1
    }
    // Return a new sorted array, no mutation
    return R.sort(comparator, events)
  }

  private findQuestionEventsByType (searchType: string | string[], markedAnswer: MarkedAnswer, audits: Audit[]): Audit[] {
    const matches = []
    if (typeof searchType === 'string') {
      searchType = [searchType]
    }

    for (const audit of audits) {
      // Eliminate audits with the wrong type
      for (const stype of searchType) {
        if (audit.type === stype) {
          if (audit.data?.sequenceNumber === markedAnswer.sequenceNumber &&
            audit.data?.question === markedAnswer.question) {
            matches.push(audit)
          }
        }
      }
    }
    return matches
  }

  private getTimerStarted (audits: Audit[], markedAnswer: MarkedAnswer): moment.Moment | null {
    const matches = this.findQuestionEventsByType('QuestionTimerStarted', markedAnswer, audits)
    // We only accept the first answer, so this will correspond to the first event.  The validated check may not be sorted.
    const sortedMatches = this.sortEvents(matches)
    if (sortedMatches.length === 0) {
      return null
    }
    return moment(sortedMatches[0].clientTimestamp)
  }

  private getTimerFinished (audits: Audit[], markedAnswer: MarkedAnswer): moment.Moment | null {
    const timerFinishedMatches = this.findQuestionEventsByType(['QuestionTimerEnded', 'QuestionTimerCancelled'], markedAnswer, audits)
    // We only accept the first answer, so this will correspond to the first event.  The validated check may not be sorted.
    const sortedMatches = this.sortEvents(timerFinishedMatches)
    if (sortedMatches.length === 0) {
      return null
    }
    return moment(sortedMatches[0].clientTimestamp)
  }

  /**
   * Generate SQL statements to insert the inputs captured during the check to the DB.
   * @param {ValidatedCheck} validatedCheck
   * @params answerId E.g. '@answerId1' - the SQL parameterName for the answerId that was already set when preparing the answers
   */
  private async prepareInputs (rawInputs: Input[], question: DBQuestion, sqlAnswerVar: string): Promise<ITransactionRequest> {
    const sortedInputs = payloadSort(rawInputs)
    const params: ISqlParameter[] = []
    const sqls: string[] = []
    let j = 0
    for (const o of sortedInputs) {
      const suffix = `${question.id}${j}`
      params.push(
        { name: `userInputQuestionId${suffix}`, value: question.id, type: TYPES.SmallInt },
        { name: `userInput${suffix}`, value: o.input, type: TYPES.NVarChar(40) },
        {
          name: `userInputTypeLookupId${suffix}`,
          value: await this.userInputService.getUserInputLookupTypeId(o.eventType),
          type: TYPES.Int
        },
        { name: `userInputBrowserTimestamp${suffix}`, value: o.clientTimestamp, type: TYPES.DateTimeOffset }
      )
      sqls.push(`INSERT INTO mtc_results.[userInput] (answer_id, userInput, userInputTypeLookup_id, browserTimestamp)
                 VALUES (${sqlAnswerVar}, @userInput${suffix}, @userInputTypeLookupId${suffix}, @userInputBrowserTimestamp${suffix});`)
      j = j + 1
    }
    return { sql: sqls.join('\n'), params }
  }

  /**
   * Prepare SQL insert statements for the answers as well as the inputs that make up the answers.
   * @param {MarkedCheck} markedCheck
   * @param {ValidatedCheck} validatedCheck
   */
  public async prepareAnswersAndInputs (markedCheck: MarkedCheck, validatedCheck: ValidatedCheck): Promise<ITransactionRequest[]> {
    const rawInputs: Input[] = R.propOr([], 'inputs', validatedCheck)
    const markedAnswers: MarkedAnswer[] = R.propOr([], 'markedAnswers', markedCheck)
    const transactions: ITransactionRequest[] = []

    let sqls: string[] = []
    let params: ISqlParameter[] = []
    let j = 0
    const sqlHead = `
        DECLARE
            @checkResultId INT = (SELECT cr.id
                                    FROM mtc_results.[checkResult] cr
                                         JOIN mtc_admin.[check] c ON (cr.check_id = c.id)
                                   WHERE c.checkCode = @checkCode);

        IF (@checkResultId IS NULL) THROW 510001, 'CheckResult ID not found when preparing answers and inputs', 1;
    `
    const headParam = { name: 'checkCode', value: markedCheck.checkCode, type: TYPES.UniqueIdentifier }

    sqls.push(sqlHead)
    params.push(headParam)

    /**
     * NB
     *
     * markedAnswers are by definition only going to be the 25 questions that were marked.  The inputs are still in raw form, and could potentially include
     * inputs from a re-played question, which can happen somehow for a very small number of checks.
     */
    for (const markedAnswer of markedAnswers) {
      let question: DBQuestion
      try {
        question = await this.questionService.findQuestion(markedAnswer.question)
      } catch (error) {
        throw new Error(`Unable to find valid question for [${markedAnswer.question}] from checkCode [${markedCheck.checkCode}]`)
      }
      const suffix = `${j}`
      sqls.push(`DECLARE @answerId${suffix} INT;
      INSERT INTO mtc_results.[answer] (checkResult_id, questionNumber, answer, question_id, isCorrect, browserTimestamp)
      VALUES (@checkResultId, @answerQuestionNumber${suffix}, @answer${suffix}, @answerQuestionId${suffix}, @answerIsCorrect${suffix},
              @answerBrowserTimestamp${suffix});
      SET @answerId${suffix} = (SELECT SCOPE_IDENTITY());
      `)
      params.push(
        { name: `answerQuestionNumber${suffix}`, value: markedAnswer.sequenceNumber, type: TYPES.SmallInt },
        { name: `answer${suffix}`, value: markedAnswer.answer, type: TYPES.NVarChar },
        { name: `answerQuestionId${suffix}`, value: question.id, type: TYPES.Int },
        { name: `answerIsCorrect${suffix}`, value: markedAnswer.isCorrect, type: TYPES.Bit },
        { name: `answerBrowserTimestamp${suffix}`, value: markedAnswer.clientTimestamp, type: TYPES.DateTimeOffset })

      /**
       * NB
       *
       * We need to filter the inputs in the case of duplicate questions as the raw inputs will include the inputs from more than one question.
       *
       */
      let inputsForThisQuestion = rawInputs.filter(o => o.question === markedAnswer.question && o.sequenceNumber === markedAnswer.sequenceNumber)
      const tmpInputs: Input[] = []

      // Only filter the inputs if we have a duplicate question to minimise any adverse filtering.
      if (this.questionWasAnsweredMoreThanOnce(validatedCheck.answers, markedAnswer)) {
        const timerStarted = this.getTimerStarted(validatedCheck.audit, markedAnswer)
        const timerEnded = this.getTimerFinished(validatedCheck.audit, markedAnswer)
        if (timerStarted !== null && timerEnded !== null) {
          inputsForThisQuestion.forEach(input => {
            const inputTime = moment(input.clientTimestamp)
            if (inputTime.isBetween(timerStarted, timerEnded, undefined, '[]')) { // inclusive of the moment timestamps
              tmpInputs.push(input)
            }
          })
          inputsForThisQuestion = tmpInputs
        }
      }

      const { sql: inputSql, params: inputParams } = await this.prepareInputs(inputsForThisQuestion, question, `@answerId${suffix}`)

      sqls.push(inputSql)
      params.push(...inputParams)
      j = j + 1
      if (params.length > 1000) {
        transactions.push({ sql: sqls.join('\n'), params: R.clone(params) })
        sqls = [sqlHead]
        params = [headParam]
      }
    }
    // push the final statements in the last transaction
    transactions.push({ sql: sqls.join('\n'), params: R.clone(params) })
    sqls = []
    params = []
    return transactions
  }
}
