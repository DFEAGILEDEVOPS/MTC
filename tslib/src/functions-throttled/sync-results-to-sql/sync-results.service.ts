import { ICheckCompletionMessage } from './models'
import { ISyncResultsDataService, SyncResultsDataService } from './sync-results.data.service'
import { ConsoleLogger, ILogger } from '../../common/logger'
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

    try {
      // delete any existing check result
      await this.syncResultsDataService.deleteExistingResultIfExists(checkCompletionMessage.markedCheck)

      // Prepare checkResult insert statement
      const checkResTran = this.syncResultsDataService.prepareCheckResult(checkCompletionMessage.markedCheck)

      // Prepare SQL statements and variables for the Answers
      const answersAndInputsTransactions = await this.syncResultsDataService.prepareAnswersAndInputs(checkCompletionMessage.markedCheck, checkCompletionMessage.validatedCheck)

      // Prepare Events
      const eventTran = await this.syncResultsDataService.prepareEvents(checkCompletionMessage.validatedCheck)

      // Prepare Device Info
      const deviceTran = await this.syncResultsDataService.prepareDeviceData(checkCompletionMessage.validatedCheck)

      await this.syncResultsDataService.insertToDatabase([checkResTran, ...answersAndInputsTransactions, eventTran, deviceTran], checkCompletionMessage?.markedCheck?.checkCode)
      this.logger.info(`${name}: going to drop the redis cache for school ${checkCompletionMessage?.validatedCheck?.schoolUUID}`)
      await this.dropRedisSchoolResult(checkCompletionMessage?.validatedCheck?.schoolUUID)
      await this.syncResultsDataService.setCheckToResultsSyncComplete(checkCompletionMessage.markedCheck)
    } catch (error) {
      this.logger.info(`marking run as failed, because: ${error.message}`)
      await this.syncResultsDataService.setCheckToResultsSyncFailed(checkCompletionMessage.markedCheck, error.message)
    }
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
