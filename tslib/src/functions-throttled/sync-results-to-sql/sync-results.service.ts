import { ICheckCompletionMessage, DBQuestion } from './models'
import { ISyncResultsDataService, SyncResultsDataService } from './sync-results.data.service'
import { ConsoleLogger, ILogger } from '../../common/logger'
import { ITransactionRequest } from '../../sql/sql.service'

const name = 'SyncResultsService (throttled)'

export class SyncResultsService {
  private readonly logger: ILogger
  private readonly syncResultsDataService: ISyncResultsDataService
  public questionHash: Map<string, DBQuestion> | undefined

  constructor (logger?: ILogger, syncResultsDataService?: SyncResultsDataService) {
    this.logger = logger ?? new ConsoleLogger()
    this.syncResultsDataService = syncResultsDataService ?? new SyncResultsDataService()
  }

  public async process (checkCompletionMessage: ICheckCompletionMessage): Promise<void> {
    this.logger.info(`${name}: message received for check [${checkCompletionMessage.markedCheck.checkCode}]`)

    if (this.questionHash === undefined) {
      this.logger.info(`${name}: fetching question data`)
      this.questionHash = await this.syncResultsDataService.sqlGetQuestionData()
    }

    // Prepare checkResult insert statement
    const checkResTran = this.syncResultsDataService.prepareCheckResult(checkCompletionMessage.markedCheck)

    // Prepare SQL statements and variables for the Answers
    const answerTran = this.syncResultsDataService.prepareAnswers(checkCompletionMessage.markedCheck, this.questionHash)

    // Prepare Events
    const eventTran = await this.syncResultsDataService.prepareEvents(checkCompletionMessage.validatedCheck)

    const flattenedTransaction = flattenTransactions([
      checkResTran,
      answerTran,
      eventTran
    ])

    await this.syncResultsDataService.insertToDatabase([flattenedTransaction])
  }
}

function flattenTransactions (transactions: ITransactionRequest[]): ITransactionRequest {
  return transactions.reduce((accumulator, currentValue) => {
    return {
      sql: accumulator.sql.concat('\n', currentValue.sql),
      params: accumulator.params.concat(currentValue.params)
    }
  })
}
