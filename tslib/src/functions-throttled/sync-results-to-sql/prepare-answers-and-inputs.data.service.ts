import { DBQuestion, Input, MarkedAnswer, MarkedCheck, ValidatedCheck } from './models'
import { ISqlParameter, ITransactionRequest } from '../../sql/sql.service'
import * as R from 'ramda'
import { TYPES } from 'mssql'
import { IQuestionService, QuestionService } from './question.service'
import { IUserInputService, UserInputService } from './user-input.service'

export interface UserInputTypeLookup {
  id: number
  code: string
  name: string
}

export interface IPrepareAnswersAndInputsDataService {
  prepareAnswersAndInputs (markedCheck: MarkedCheck, validatedCheck: ValidatedCheck): Promise<ITransactionRequest>
}

export class PrepareAnswersAndInputsDataService {
  private readonly questionService: IQuestionService
  private readonly userInputService: IUserInputService

  constructor (questionService?: IQuestionService, userInputService?: IUserInputService) {
    this.questionService = questionService ?? new QuestionService()
    this.userInputService = userInputService ?? new UserInputService()
  }

  /**
   * Generate SQL statements to insert the inputs captured during the check to the DB.
   * @param {ValidatedCheck} validatedCheck
   * @params answerId E.g. '@answerId1' - the SQL parameterName for the answerId that was already set when preparing the answers
   */
  private async prepareInputs (rawInputs: Input[], question: DBQuestion, sqlAnswerVar: string): Promise<ITransactionRequest> {
    const params: ISqlParameter[] = []
    const sqls: string[] = []
    let j = 0
    for (const o of rawInputs) {
      const suffix = `${question.id}${j}`
      params.push(
        { name: `userInputQuestionId${suffix}`, value: question.id, type: TYPES.SmallInt },
        { name: `userInput${suffix}`, value: o.input, type: TYPES.NVarChar(40) },
        {
          name: `userInputTypeLookupId${suffix}`,
          value: await this.userInputService.getUserInputLookupTypeId(o.eventType),
          type: TYPES.NVarChar(40)
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
  public async prepareAnswersAndInputs (markedCheck: MarkedCheck, validatedCheck: ValidatedCheck): Promise<ITransactionRequest> {
    const rawInputs: Input[] = R.propOr([], 'inputs', validatedCheck)
    const markedAnswers: MarkedAnswer[] = R.propOr([], 'markedAnswers', markedCheck)

    const sqls: string[] = []
    const params: ISqlParameter[] = []
    let j = 0

    sqls.push(`
        DECLARE
            @checkResultId INT = (SELECT cr.id
                                    FROM mtc_results.[checkResult] cr
                                         JOIN mtc_admin.[check] c ON (cr.check_id = c.id)
                                   WHERE c.checkCode = @checkCode);

        IF (@checkResultId IS NULL) THROW 510001, 'CheckResult ID not found when preparing answers and inputs', 1;
    `)
    params.push({ name: 'checkCode', value: markedCheck.checkCode, type: TYPES.UniqueIdentifier })

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
      const inputsForThisQuestion = rawInputs.filter(o => o.question === markedAnswer.question && o.sequenceNumber === markedAnswer.sequenceNumber)
      const { sql: inputSql, params: inputParams } = await this.prepareInputs(inputsForThisQuestion, question, `@answerId${suffix}`)

      sqls.push(inputSql)
      params.push(...inputParams)
      j = j + 1
    }
    return { sql: sqls.join('\n'), params }
  }
}
