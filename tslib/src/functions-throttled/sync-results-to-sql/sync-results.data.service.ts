import { ISqlService, ITransactionRequest, SqlService } from '../../sql/sql.service'
import { DBQuestion, MarkedCheck } from './models'
import { TYPES } from 'mssql'
import * as R from 'ramda'

export interface ISyncResultsDataService {
  sqlGetQuestionData (): Promise<Map<string, DBQuestion>>

  insertToDatabase (requests: ITransactionRequest[]): Promise<void>

  prepareCheckResult (markedCheck: MarkedCheck): ITransactionRequest

  prepareAnswers (markedheck: MarkedCheck, questionHash: Map<string, DBQuestion>): ITransactionRequest
}

export class SyncResultsDataService implements ISyncResultsDataService {
  private sqlService: ISqlService

  constructor (sqlService?: ISqlService) {
    if (!sqlService) {
      this.sqlService = new SqlService()
    } else {
      this.sqlService = sqlService
    }
  }

  public async sqlGetQuestionData (): Promise<Map<string, DBQuestion>> {
    const sql = 'SELECT id, factor1, factor2, code, isWarmup FROM mtc_admin.question'
    const data: DBQuestion[] = await this.sqlService.query(sql)
    const map = new Map<string, DBQuestion>()
    data.forEach(o => {
      if (o.isWarmup === false) {
        map.set(`${o.factor1}x${o.factor2}`, Object.freeze(o))
      }
    })
    return map
  }

  public async insertToDatabase (requests: ITransactionRequest[]): Promise<void> {
    console.log('call insertToDatabase with', requests)
    return this.sqlService.modifyWithTransaction(requests)
  }

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
}
