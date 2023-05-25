import { type IPreparedCheckSyncDataService, PreparedCheckSyncDataService, type IActiveCheckReference } from './prepared-check-sync.data.service'
import { type IPreparedCheckMergeService, PreparedCheckMergeService, type IPreparedCheck } from './prepared-check-merge.service'
import { type IRedisService, RedisService } from '../../caching/redis-service'
import { type ILogger, ConsoleLogger } from '../../common/logger'
import { isNil } from 'ramda'

export class PreparedCheckSyncService {
  private readonly dataService: IPreparedCheckSyncDataService
  private readonly mergeService: IPreparedCheckMergeService
  private readonly redisService: IRedisService
  private readonly logger: ILogger
  private readonly name = 'check-sync'

  constructor (dataService?: IPreparedCheckSyncDataService, mergeService?: IPreparedCheckMergeService,
    redisService?: IRedisService, logger?: ILogger) {
    if (dataService === undefined) {
      dataService = new PreparedCheckSyncDataService()
    }
    this.dataService = dataService
    if (mergeService === undefined) {
      mergeService = new PreparedCheckMergeService()
    }
    this.mergeService = mergeService
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService
    if (logger === undefined) {
      logger = new ConsoleLogger()
    }
    this.logger = logger
  }

  async process (pupilUUID: string): Promise<void> {
    const checkReferences = await this.dataService.getActiveCheckReferencesByPupilUuid(pupilUUID)
    if (checkReferences.length === 0) {
      return
    }
    for (let index = 0; index < checkReferences.length; index++) {
      const ref = checkReferences[index]
      this.logger.info(`${this.name}: syncing check: checkCode:${ref.checkCode}`)
      const cacheKey = this.buildPreparedCheckCacheKey(ref)
      const preparedCheck: IPreparedCheck = await this.redisService.get(cacheKey) as IPreparedCheck
      if (isNil(preparedCheck)) {
        this.logger.info(`${this.name}: unable to find preparedCheck in redis: checkCode:${ref.checkCode}`)
        continue
      }
      const newAaConfig = await this.dataService.getAccessArrangementsByCheckCode(preparedCheck.checkCode)
      const updatedConfig = await this.mergeService.merge(preparedCheck.config, newAaConfig)
      preparedCheck.config = updatedConfig
      const ttl = await this.redisService.ttl(cacheKey)
      if (ttl === null) {
        this.logger.error(`${this.name}: no TTL found on preparedCheck: checkCode:${ref.checkCode}`)
        continue
      }
      await this.redisService.setex(cacheKey, preparedCheck, ttl)
      try {
        await this.dataService.sqlUpdateCheckConfig(ref.checkCode, updatedConfig)
      } catch (error) {
        this.logger.error(`Error failed to update check ${ref.checkCode} with new access arrangements: ${error.message}`)
      }
    }
  }

  buildPreparedCheckCacheKey (checkReference: IActiveCheckReference): string {
    return `preparedCheck:${checkReference.schoolPin}:${checkReference.pupilPin}`
  }
}
