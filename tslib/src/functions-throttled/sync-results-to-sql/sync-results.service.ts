import { ICheckCompletionMessage, DBQuestion } from './models'
import { ISyncResultsDataService, SyncResultsDataService } from './sync-results.data.service'
import { ConsoleLogger, ILogger } from '../../common/logger'
import { ITransactionRequest } from '../../sql/sql.service'

const name = 'SyncResultsService (throttled)'

export class SyncResultsService {
  private logger: ILogger
  private syncResultsDataService: ISyncResultsDataService
  public questionHash: Map<string, DBQuestion> | undefined

  constructor (logger?: ILogger, syncResultsDataService?: SyncResultsDataService) {
    if (!logger) {
      this.logger = new ConsoleLogger()
    } else {
      this.logger = logger
    }

    if (!syncResultsDataService) {
      this.syncResultsDataService = new SyncResultsDataService()
    } else {
      this.syncResultsDataService = syncResultsDataService
    }
  }

  public async process (checkCompletionMessage: ICheckCompletionMessage) {
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

    // Prepare Device Info
    const deviceTran = await this.syncResultsDataService.prepareDeviceData(checkCompletionMessage.validatedCheck)

    const flattenedTransaction = flattenTransactions([
      checkResTran,
      answerTran,
      eventTran,
      deviceTran
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
