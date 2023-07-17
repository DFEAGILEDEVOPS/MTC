import { SqlService, type ISqlService } from '../../sql/sql.service'
import { type DBQuestion } from './models'

export interface IQuestionService {
  findQuestion (question: string): Promise<DBQuestion>
}

export class QuestionService implements IQuestionService {
  private readonly sqlService: ISqlService
  private readonly questionCache = new Map<string, DBQuestion>()
  private initialised = false

  constructor (sqlService?: ISqlService) {
    this.sqlService = sqlService ?? new SqlService()
  }

  private async sqlGetQuestionData (): Promise<DBQuestion[]> {
    const sql = 'SELECT id, factor1, factor2, code, isWarmup FROM mtc_admin.question'
    return this.sqlService.query(sql)
  }

  /**
   * Retrieve the SQL question data and cache it in a Map indexed by the question e.g. '1x2'
   */
  public async cacheQuestionData (): Promise<void> {
    const data = await this.sqlGetQuestionData()
    this.questionCache.clear()
    data.forEach(o => {
      if (!o.isWarmup) {
        this.questionCache.set(`${o.factor1}x${o.factor2}`, Object.freeze(o))
      }
    })
  }

  private async initialise (): Promise<void> {
    await this.cacheQuestionData()
    this.initialised = true
  }

  /**
   * Find a question from the database given a string representing the question, like '1x2'
   * Useful for creating the FKs to the question.  Uses the questionData cache.
   * @param question
   * @private
   */
  public async findQuestion (question: string): Promise<DBQuestion> {
    if (!this.initialised) {
      await this.initialise()
    }
    if (this.questionCache === undefined) {
      throw new Error(`No questions cached: ${question}`)
    }
    const dbQuestion = this.questionCache.get(question)
    if (dbQuestion === undefined) {
      throw new Error(`Unable to find question: ${question}`)
    }
    return dbQuestion
  }
}
