import { ICheckCompletionMessage } from './models'
import { ISyncResultsDataService, SyncResultsDataService } from './sync-results.data.service'
import { ConsoleLogger, ILogger } from '../../common/logger'
import { ITransactionRequest } from '../../sql/sql.service'
import { IRedisService, RedisService } from '../../caching/redis-service'
import redisKeyService from '../../caching/redis-key.service'

const name = 'SyncResultsService (throttled)'

export class SyncResultsService {
  private readonly logger: ILogger
  private readonly syncResultsDataService: ISyncResultsDataService
  private readonly redisService: IRedisService

  constructor (logger?: ILogger, syncResultsDataService?: ISyncResultsDataService, redisService?: IRedisService) {
    this.logger = logger ?? new ConsoleLogger()
    this.syncResultsDataService = syncResultsDataService ?? new SyncResultsDataService(this.logger)
    this.redisService = redisService ?? new RedisService(this.logger)
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

    await this.syncResultsDataService.insertToDatabase([flattenedTransaction], checkCompletionMessage?.markedCheck?.checkCode)
    this.logger.info(`${name}: going to drop the redis cache for school ${checkCompletionMessage?.validatedCheck?.schoolUUID}`)
    await this.dropRedisSchoolResult(checkCompletionMessage?.validatedCheck?.schoolUUID)
  }

  private async dropRedisSchoolResult (schoolUuid: string): Promise<void> {
    if (schoolUuid === undefined) {
      this.logger.error(`${name}: dropRedisSchoolResult(): no school uuid parameter`)
      return
    }
    const schoolId = await this.syncResultsDataService.getSchoolId(schoolUuid)
    this.logger.verbose(`${name}: school id retrieved: [${schoolId}]`)
    if (schoolId === undefined) {
      this.logger.error(`${name}: dropRedisSchoolResult(): schoolId not found for uuid ${schoolUuid}`)
      return
    }
    const key = redisKeyService.getSchoolResultsKey(schoolId)
    this.logger.verbose(`${name}: redis key to drop: [${key}]`)
    await this.redisService.drop([key])
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
