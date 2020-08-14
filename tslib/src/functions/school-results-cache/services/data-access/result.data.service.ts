'use strict'

import { SqlService, ISqlService } from '../../../../sql/sql.service'
import { TYPES } from 'mssql'
import * as moment from 'moment'

export class ResultDataService {
  private sqlService: ISqlService

  constructor (sqlService?: ISqlService) {
    if (sqlService === undefined) {
      sqlService = new SqlService()
    }
    this.sqlService = sqlService
  }

  /**
   * Provide the raw data for pupil scores (pupil details, scores, not attending info, and data for determining the results status)
   * @param {number} schoolId - school.id from database
   * @return {Promise<*>}
   */
  async sqlFindPupilResultsForSchool (schoolId: number): Promise<Array<IRawPupilResult>> {
    const sql = `SELECT
                     p.id AS pupilId,
                     p.foreName,
                     p.middleNames,
                     p.lastName,
                     p.group_id,
                     p.dateOfBirth,
                     p.urlSlug,
                     p.checkComplete,
                     p.currentCheckId,
                     p.restartAvailable,
                     p.attendanceId,
                     p.school_id,
                     cs.mark,
                     ac.code AS attendanceCode,
                     ac.reason AS attendanceReason
                   FROM mtc_admin.[pupil] p
                        LEFT JOIN mtc_admin.checkScore cs ON (cs.checkId = p.currentCheckId)
                        LEFT JOIN mtc_admin.attendanceCode ac ON (ac.id = p.attendanceId)
                  WHERE p.school_id = @schoolId;`
    const params = [
      {
        name: 'schoolId',
        value: schoolId,
        type: TYPES.Int
      }
    ]
    return this.sqlService.query(sql, params)
  }
}

/**
 * This structure gives us enough information to show the pupil in the interface, some fields so we can order the pupil list, and
 * and some additional fields so we can work out the pupil's status.
 */
export interface IRawPupilResult {
  attendanceCode: null | string,
  attendanceId: null | number,
  attendanceReason: null | string
  checkComplete: boolean,
  currentCheckId: null | number,
  dateOfBirth: moment.Moment,
  foreName: string,
  group_id: null | number,
  lastName: string,
  mark: null | number,
  middleNames: string,
  pupilId: number,
  restartAvailable: boolean,
  school_id: number,
  urlSlug: string,
}

export interface IResultDataService {
  sqlFindPupilResultsForSchool (schoolId: number): Promise<Array<IRawPupilResult>>
}
