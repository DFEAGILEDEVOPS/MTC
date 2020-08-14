'use strict'

// const moment = require('moment')

// import { RedisService } from '../../../caching/redis-service'
// const redisService = new RedisService()
//
// const redisKeyService = require('./redis-key.service')
// const config = require('../../config')

const sortService = require('../../../common/table-sorting')
import pupilIdentificationService from './pupil-identification.service'

import { ResultDataService, IResultDataService, IRawPupilResult } from './data-access/result.data.service'
import moment from 'moment'

export class ResultService {
  private resultDataService: IResultDataService

  public readonly status: IResultsServicePupilStatus = Object.freeze({
    restartNotTaken: 'Did not attempt the restart',
    incomplete: 'Incomplete',
    didNotParticipate: 'Did not participate',
    complete: ''
  })

  constructor (resultDataService?: IResultDataService) {
    if (resultDataService === undefined) {
      resultDataService = new ResultDataService()
    }
    this.resultDataService = resultDataService
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

  /**
   *
   * @param schoolId
   * @return {Promise<{pupils: {foreName:string, middleNames:string, lastName:string, group_id:null|number, dateOfBirth: Moment.moment, mark:null|number, status:string}[], schoolId: number, generatedAt: (*|moment.Moment)}>}
   */
  async getPupilResultDataFromDb (schoolId: number) {
    const data = await this.resultDataService.sqlFindPupilResultsForSchool(schoolId)
    return {
      generatedAt: moment(),
      schoolId: schoolId,
      pupils: pupilIdentificationService.addIdentificationFlags(this.sort(this.createPupilData(data)))
    }
  }

  //
  // /**
  //  * Find pupils with results based on school id and merge with pupil register data
  //  * @param {Number} schoolId
  //  * @param {function} logger
  //  * @return {Promise<void>}
  //  */
  // cacheResultData: async function getPupilResultData (schoolId, logger) {
  //   if (!schoolId) {
  //     throw new Error('school id not found')
  //   }
  //   redisCacheService.setLogger(logger)
  //   const redisKey = redisKeyService.getSchoolResultsKey(schoolId)
  //   let result = await redisCacheService.get(redisKey)
  //   if (!result) {
  //     result = await this.getPupilResultDataFromDb(schoolId)
  //     try {
  //       await redisCacheService.set(redisKey, result, config.RedisResultsExpiryInSeconds)
  //     } catch (ignored) {}
  //   }
  // }
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
