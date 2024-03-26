import { validate as validateUuid } from 'uuid'
import { PupilAnnulmentDataService } from './pupil-annulment.data.service'
const redisKeyService = require('../../redis-key.service')
const redisCacheService = require('../../data-access/redis-cache.service')

export enum AnnulmentType {
  Maladministration = 'ANLLQ',
  PupilCheating = 'ANLLH'
}

export class PupilAnnulmentService {
  static async applyAnnulment (pupilUrlSlug: string, serviceManagerUserId: number, pupilSchoolId: number, annulmentType: AnnulmentType): Promise<void> {
    if (pupilUrlSlug === undefined) {
      throw new Error('pupilUrlSlug is required')
    }
    if (!validateUuid(pupilUrlSlug)) {
      throw new Error('a valid uuid is required for pupilUrlSlug')
    }
    if (annulmentType === undefined) {
      throw new Error('annulmentType is required')
    }
    const pupilRegisterRedisKey = redisKeyService.getPupilRegisterViewDataKey(pupilSchoolId)
    await redisCacheService.drop(pupilRegisterRedisKey)
    const schoolResultsKey = redisKeyService.getSchoolResultsKey(pupilSchoolId)
    await redisCacheService.drop(schoolResultsKey)
    return PupilAnnulmentDataService.setAnnulmentByUrlSlug(pupilUrlSlug, serviceManagerUserId, annulmentType)
  }

  static async removeAnnulment (pupilUrlSlug: string, serviceManagerUserId: number, pupilSchoolId: number): Promise<void> {
    if (pupilUrlSlug === undefined) {
      throw new Error('pupilUrlSlug is required')
    }

    if (!validateUuid(pupilUrlSlug)) {
      throw new Error('a valid uuid is required for pupilUrlSlug')
    }
    const pupilRegisterRedisKey = redisKeyService.getPupilRegisterViewDataKey(pupilSchoolId)
    await redisCacheService.drop(pupilRegisterRedisKey)
    const schoolResultsKey = redisKeyService.getSchoolResultsKey(pupilSchoolId)
    await redisCacheService.drop(schoolResultsKey)
    return PupilAnnulmentDataService.undoAnnulmentByUrlSlug(pupilUrlSlug, serviceManagerUserId)
  }
}
