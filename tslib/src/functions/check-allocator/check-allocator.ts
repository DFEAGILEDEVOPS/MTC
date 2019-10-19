import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { IRedisService, RedisService } from '../../caching/redis-service'
import * as config from '../../config'
import * as moment from 'moment'

export interface ICheckAllocatorDataService {
  getPupilsBySchoolUuid (schoolUUID: string): Promise<Array<IPupil>>
}

export class CheckAllocatorDataService implements ICheckAllocatorDataService {
  async getPupilsBySchoolUuid (schoolUUID: string): Promise<Array<IPupil>> {
    throw new Error('Method not implemented.')
  }
}

export interface IPupilPinGenerator {
  generate (): number
}

export class PupilPinGenerator implements IPupilPinGenerator {
  generate (): number {
    throw new Error('not implemented')
  }
}

export interface ICheckFormAllocator {
  allocate (pupilId: number): any
}

export class CheckFormAllocator implements ICheckFormAllocator {
  allocate (pupilId: number): any {
    throw new Error('not implemented')
  }
}

export interface IDateTimeService {
  utcNow (): Date
}

export class DateTimeService implements IDateTimeService {
  utcNow (): Date {
    return moment.utc().toDate()
  }

}

export interface IPupil {
  id: number
}

export interface IPupilAllocation {
  id: number
  pin?: number
  allocatedForm?: any,
  allocatedAtUtc: Date
}

export interface ISchoolAllocation {
  schoolUUID: string
  pupils: Array<IPupil>
  lastReplenishmentUtc: Date
}

export class CheckAllocatorV1 {
  private _dataService: ICheckAllocatorDataService
  private _pupilPinGenerator: IPupilPinGenerator
  private _formAllocator: ICheckFormAllocator
  private _redisService: IRedisService
  private _dateTimeService: IDateTimeService
  private uuidV4RegexPattern = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  private redisAllocationsKeyPrefix = 'pupil-allocations:'

  constructor (checkAllocatorDataService?: ICheckAllocatorDataService,
            pupilPinGenerator?: IPupilPinGenerator,
            formAllocator?: ICheckFormAllocator,
            redisService?: IRedisService,
            dateTimeService?: IDateTimeService) {

    if (checkAllocatorDataService === undefined) {
      checkAllocatorDataService = new CheckAllocatorDataService()
    }
    this._dataService = checkAllocatorDataService

    if (pupilPinGenerator === undefined) {
      pupilPinGenerator = new PupilPinGenerator()
    }
    this._pupilPinGenerator = pupilPinGenerator

    if (formAllocator === undefined) {
      formAllocator = new CheckFormAllocator()
    }
    this._formAllocator = formAllocator

    if (redisService === undefined) {
      redisService = new RedisService()
    }
    this._redisService = redisService

    if (dateTimeService === undefined) {
      dateTimeService = new DateTimeService()
    }
    this._dateTimeService = dateTimeService
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
      const match = R.find(R.propEq('id', pupil.id))(existingAllocations.pupils)
      if (match) continue
      const pupilAllocation: IPupilAllocation = {
        id: pupil.id,
        pin: this._pupilPinGenerator.generate(),
        allocatedForm: this._formAllocator.allocate(pupil.id),
        allocatedAtUtc: this._dateTimeService.utcNow()
      }
      existingAllocations.pupils.push(pupilAllocation)
    }
    existingAllocations.lastReplenishmentUtc = this._dateTimeService.utcNow()
    await this._redisService.setex(schoolKey, existingAllocations,
      +config.default.CheckAllocation.ExpiryTimeInSeconds)
  }
}
