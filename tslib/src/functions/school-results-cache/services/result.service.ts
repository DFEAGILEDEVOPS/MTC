import moment from 'moment-timezone'
import * as R from 'ramda'

import config from '../../../config'
import pupilIdentificationService, { IdentifiedPupilResult } from './pupil-identification.service'
import redisKeyService from './redis-key.service'
import sortService from '../../../common/table-sorting'
import { ConsoleLogger, ILogger } from '../../../common/logger'
import { IRedisService, RedisService } from '../../../caching/redis-service'
import { ResultDataService, IResultDataService, IRawPupilResult } from './data-access/result.data.service'

const defaultTimeZone = 'Europe/London'
const logPrefix = 'school-results-cache: result.service'

export class ResultService {
  private resultDataService: IResultDataService
  private redisService: IRedisService
  private logger: ILogger

  public readonly status: IResultsServicePupilStatus = Object.freeze({
    restartNotTaken: 'Did not attempt the restart',
    incomplete: 'Incomplete',
    didNotParticipate: 'Did not participate',
    complete: ''
  })

  constructor (logService?: ILogger, resultDataService?: IResultDataService, redisCacheService?: IRedisService) {
    if (logService === undefined) {
      logService = new ConsoleLogger()
    }
    this.logger = logService

    if (resultDataService === undefined) {
      resultDataService = new ResultDataService()
    }
    this.resultDataService = resultDataService

    if (redisCacheService === undefined) {
      redisCacheService = new RedisService()
    }
    this.redisService = redisCacheService
  }

  sort (data: Array<IPupilResult>): Array<IPupilResult> {
    return sortService.sortByProps(['lastName', 'foreName', 'dateOfBirth', 'middleNames'], data)
  }

  /**
   * Construct the result status for the pupil
   */
  assignStatus (pupil: IRawPupilResult): string {
    if (pupil.restartAvailable) {
      return this.status.restartNotTaken
    }

    if (pupil.currentCheckId) {
      if (pupil.checkComplete === true) {
        return this.status.complete
      } else {
        return this.status.incomplete
      }
    } else {
      if (pupil.attendanceReason) {
        return pupil.attendanceReason
      } else {
        return this.status.didNotParticipate
      }
    }
  }

  /**
   * Return pupil data showing mark, and status
   * @param pupils
   * @return {*}
   */
  createPupilData (pupils: Array<IRawPupilResult>): Array<IPupilResult> {
    return pupils.map(o => {
      return {
        foreName: o.foreName,
        middleNames: o.middleNames,
        lastName: o.lastName,
        group_id: o.group_id,
        dateOfBirth: o.dateOfBirth,
        score: o.mark,
        status: this.assignStatus(o),
        urlSlug: o.urlSlug
      }
    })
  }

  async getPupilResultDataFromDb (schoolGuid: string): Promise<{ generatedAt: moment.Moment, schoolId: number, pupils: Array<IdentifiedPupilResult> }> {
    const school = await this.resultDataService.sqlFindSchool(schoolGuid)
    if (!school) {
      throw new Error(`Unable to find school with Guid ${schoolGuid}`)
    }
    const data = await this.resultDataService.sqlFindPupilResultsForSchool(school.id)
    return {
      // Date generated should be in user's locale
      generatedAt: moment.tz(school.timezone || defaultTimeZone),
      // @ts-ignore Ramda does not have good typescript support
      schoolId: R.prop('school_id', R.head(data)),
      pupils: pupilIdentificationService.addIdentificationFlags(this.sort(this.createPupilData(data)))
    }
  }

  /**
   * Find pupils with results based on school id and merge with pupil register data
   * @param {Number} schoolId
   * @param {function} logger
   * @return {Promise<void>}
   */
  async cacheResultData (schoolGuid: string): Promise<void> {
    if (!schoolGuid) {
      throw new Error('schoolGuid not found')
    }

    // The message is an instruction to cache the latest data for the school.  Therefore, we don't check
    // whether existing data exists, we will overwrite it, should it exist.
    const result = await this.getPupilResultDataFromDb(schoolGuid)
    if (!(result.pupils && result.pupils.length > 0)) {
      this.logger.warn(`${logPrefix}: No pupils found for school ${schoolGuid}`)
      return
    }
    const redisKey = redisKeyService.getSchoolResultsKey(result.schoolId)
    try {
      await this.redisService.setex(redisKey, result, config.SchoolResultsCache.RedisResultsExpiryInSeconds)
    } catch (error) {
      this.logger.error(`${logPrefix}: Failed to write to Redis: ${error.message}`)
      // This is likely a temporary error.  We should throw here, and let the message
      // be delivered and processed again.
      throw error
    }
  }
}

export interface IResultsServicePupilStatus {
  restartNotTaken: string,
  incomplete: string,
  didNotParticipate: string,
  complete: string,
}

export interface IPupilResult {
  foreName: string,
  middleNames: string,
  lastName: string,
  group_id: null | number,
  dateOfBirth: moment.Moment,
  score: null | number,
  status: string,
  urlSlug: string
}
