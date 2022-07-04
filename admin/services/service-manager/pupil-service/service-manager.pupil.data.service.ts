import moment, { Moment } from 'moment-timezone'
import { TYPES } from '../../data-access/sql.service'
const sqlService = require('../../data-access/sql.service')

export class ServiceManagerPupilDataService {

  static async findPupilByUpn (upn: string): Promise<PupilSearchResult[]> {
    const sql = `
      SELECT p.foreName, p.lastName, p.dateOfBirth,
        s.name as [schoolName], s.urn, s.dfeNumber,
        p.urlSlug, s.id as [schoolId]
      FROM mtc_admin.pupil p
      INNER JOIN mtc_admin.school s ON s.id = p.school_id
      WHERE upn = @upn`
    const params = [
      {
        name: 'upn',
        value: upn,
        type: TYPES.NVarChar
      }
    ]
    return sqlService.readonlyQuery(sql, params)
  }

  static async getPupilByUrlSlug (urlSlug: string): Promise<PupilSearchResult[]> {
    const sql = `
      SELECT p.id, p.foreName, p.lastName, p.dateOfBirth,
        s.name as [schoolName], s.urn, s.dfeNumber,
        p.urlSlug, p.upn, s.id as [schoolId],
        ac.code as [attendanceCode]
      FROM mtc_admin.pupil p
      INNER JOIN mtc_admin.school s ON s.id = p.school_id
      LEFT OUTER JOIN mtc_admin.attendanceCode ac ON ac.id = p.attendanceId
      WHERE p.urlSlug = @urlSlug`
    const params = [
      {
        name: 'urlSlug',
        value: urlSlug,
        type: TYPES.NVarChar
      }
    ]
    return sqlService.readonlyQuery(sql, params)
  }

  static async getPupilStatusData (pupilId: number): Promise<PupilStatusData[]> {
    const sql = `
      SELECT *
      FROM mtc_admin.vewPupilStatus
      WHERE pupilId=@pupilId`
  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]
  return sqlService.readonlyQuery(sql, params)
  }
}

export interface PupilStatusData {
  id: number
  foreName: string
  lastName: string
  middleNames: string
  dateOfBirth: Moment
  group_id: number
  urlSlug: string
  school_id: number
  reason: string
  reasonCode: string
  attendanceId: number
  pupilCheckComplete: boolean
  currentCheckId: number
  pupilId: number
  restartAvailable: boolean
  checkReceived: boolean
  checkComplete: boolean
  processingFailed: boolean
  pupilLoginDate: Moment
  pinExpiresAt: Moment
}

export interface PupilSearchResult {
  id: number
  urlSlug: string
  foreName: string
  lastName: string
  dateOfBirth: Moment
  schoolName: string
  urn: number
  dfeNumber: number
  upn: string
  schoolId: number
  attendanceCode: string
}
