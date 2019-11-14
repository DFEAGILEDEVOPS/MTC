import { IPreparedCheckSyncDataService, PreparedCheckSyncDataService } from './prepared-check-sync.data.service'
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
    const checksToUpdate = await this.dataService.getActiveCheckReferencesByPupilUuid(pupilUUID)
    if (checksToUpdate.length === 0) {
      throw new Error(`no checks found for pupil UUID:${pupilUUID}`)
    }
    for (let index = 0; index < checksToUpdate.length; index++) {
      const check = checksToUpdate[index]
      const merged = await this.mergeService.merge(check)
      await this.redisService.setex('x', merged, 0)
    }
  }
}

export interface IPreparedCheckSyncMessage {
  version: number
  pupilUUID: string
}
