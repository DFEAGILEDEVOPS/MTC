import { IPreparedCheckSyncDataService, PreparedCheckSyncDataService, IActiveCheckReference } from './prepared-check-sync.data.service'
import { IPreparedCheckMergeService, PreparedCheckMergeService } from './prepared-check-merge.service'
import { IRedisService, RedisService } from '../../caching/redis-service'

export class PreparedCheckSyncService {
  private dataService: IPreparedCheckSyncDataService
  private mergeService: IPreparedCheckMergeService
  private redisService: IRedisService

  constructor (dataService?: IPreparedCheckSyncDataService, mergeService?: IPreparedCheckMergeService,
    redisService?: IRedisService) {
    if (dataService === undefined) {
      dataService = new PreparedCheckSyncDataService()
    }
    this.dataService = dataService
    if (mergeService === undefined) {
      mergeService = new PreparedCheckMergeService(this.dataService)
    }
    this.mergeService = mergeService
    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this.redisService = redisService
  }

  async process (pupilUUID: string): Promise<void> {
    const checkReferences = await this.dataService.getActiveCheckReferencesByPupilUuid(pupilUUID)
    if (checkReferences.length === 0) {
      throw new Error(`no checks found for pupil UUID:${pupilUUID}`)
    }
    for (let index = 0; index < checkReferences.length; index++) {
      const ref = checkReferences[index]
      const cacheKey = this.buildPreparedCheckCacheKey(ref)
      const preparedCheck = await this.redisService.get(cacheKey)
      if (preparedCheck === null) {
        throw new Error(`unable to find preparedCheck. checkCode:${ref.checkCode}`)
      }
      const ttl = await this.redisService.ttl(cacheKey)
      if (ttl === null) {
        throw new Error(`no TTL found on preparedCheck. checkCode:${ref.checkCode}`)
      }
      const updatedPreparedCheck = await this.mergeService.merge(preparedCheck)
      await this.redisService.setex(cacheKey, updatedPreparedCheck, ttl)
    }
  }

  buildPreparedCheckCacheKey (checkReference: IActiveCheckReference): string {
    return `preparedCheck:${checkReference.schoolPin}:${checkReference.pupilPin}`
  }
}

export interface IPreparedCheckSyncMessage {
  version: number
  pupilUUID: string
}
