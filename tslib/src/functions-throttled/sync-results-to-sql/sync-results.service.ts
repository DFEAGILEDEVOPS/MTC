import { ICheckCompletionMessage } from './models'
import { ISyncResultsDataService, SyncResultsDataService } from './sync-results.data.service'
import { ConsoleLogger, ILogger } from '../../common/logger'
import { ITransactionRequest } from '../../sql/sql.service'

const name = 'SyncResultsService (throttled)'

export class SyncResultsService {
  private readonly logger: ILogger
  private readonly syncResultsDataService: ISyncResultsDataService

  constructor (logger?: ILogger, syncResultsDataService?: SyncResultsDataService) {
    this.logger = logger ?? new ConsoleLogger()
    this.syncResultsDataService = syncResultsDataService ?? new SyncResultsDataService()
  }

  public async process (checkCompletionMessage: ICheckCompletionMessage): Promise<void> {
    this.logger.info(`${name}: message received for check [${checkCompletionMessage.markedCheck.checkCode}]`)

    // Prepare checkResult insert statement
    const checkResTran = this.syncResultsDataService.prepareCheckResult(checkCompletionMessage.markedCheck)

    // Prepare SQL statements and variables for the Answers
    const answersAndInputsTran = await this.syncResultsDataService.prepareAnswersAndInputs(checkCompletionMessage.markedCheck, checkCompletionMessage.validatedCheck)

    // Prepare Events
    const eventTran = await this.syncResultsDataService.prepareEvents(checkCompletionMessage.validatedCheck)

    // Prepare Device Info
    const deviceTran = await this.syncResultsDataService.prepareDeviceData(checkCompletionMessage.validatedCheck)

    // This looks a little unusual as we could pass an array of ITransactions into insertToDatabase()
    // which is just passing the args on to sqlService.modifyWithTransaction(). Take note that the SQL is produced in pieces but
    // needs to be combined into a single SQL statement so we can re-use SQL variables like @checkResultId.  Therefore, the above work
    // must take care not to re-use the same variable name.  E.g. it would be easy to clash on terms like @browserTimestamp1, so instead,
    // rename them to @userInputBrowserTimestamp1 and use the destination table as a prefix.
    const flattenedTransaction = flattenTransactions([
      checkResTran,
      answersAndInputsTran,
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
