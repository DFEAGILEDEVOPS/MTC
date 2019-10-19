import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { IRedisService, RedisService } from '../../caching/redis-service'
import * as config from '../../config'
import { IDateTimeService, DateTimeService } from '../../common/DateTimeService'
import { ICheckAllocatorDataService, CheckAllocatorDataService } from './ICheckAllocatorDataService'
import { IPupilAllocationService, PupilAllocationService } from './PupilAllocationService.spec'

export class CheckAllocatorV1 {
  private _dataService: ICheckAllocatorDataService
  private _redisService: IRedisService
  private _dateTimeService: IDateTimeService
  private _pupilAllocationService: IPupilAllocationService
  private uuidV4RegexPattern = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  private redisAllocationsKeyPrefix = 'pupil-allocations:'

  constructor (checkAllocatorDataService?: ICheckAllocatorDataService,
            redisService?: IRedisService,
            dateTimeService?: IDateTimeService,
            pupilAllocationService?: IPupilAllocationService) {

    if (checkAllocatorDataService === undefined) {
      checkAllocatorDataService = new CheckAllocatorDataService()
    }
    this._dataService = checkAllocatorDataService

    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this._redisService = redisService

    if (dateTimeService === undefined) {
      dateTimeService = new DateTimeService()
    }
    this._dateTimeService = dateTimeService

    if (pupilAllocationService === undefined) {
      pupilAllocationService = new PupilAllocationService()
    }
    this._pupilAllocationService = pupilAllocationService
  }

  async allocate (schoolUUID: string) {
    if (!schoolUUID.match(this.uuidV4RegexPattern)) {
      throw new Error('schoolUUID argument was not a v4 UUID')
    }

    const pupils = await this._dataService.getPupilsBySchoolUuid(schoolUUID)
    const schoolKey = this.redisAllocationsKeyPrefix.concat(schoolUUID)
    const existingAllocations = await this._redisService.get(schoolKey)
    if (RA.isNilOrEmpty(pupils)) return

    for (let pupilIndex = 0; pupilIndex < pupils.length; pupilIndex++) {
      const pupil = pupils[pupilIndex]
      console.log(`count: ${existingAllocations.pupils.length}`)
      if (existingAllocations.pupils.length > 0) {
        console.log('finding pupil...')
        const match = R.find(R.propEq('id', pupil.id))(existingAllocations.pupils)
        if (match) continue
      }
      const pupilAllocation = await this._pupilAllocationService.allocate(pupil)
      existingAllocations.pupils.push(pupilAllocation)
    }
    existingAllocations.lastReplenishmentUtc = this._dateTimeService.utcNow()
    await this._redisService.setex(schoolKey, existingAllocations,
      +config.default.CheckAllocation.ExpiryTimeInSeconds)
  }
}
