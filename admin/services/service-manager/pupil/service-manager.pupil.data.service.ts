import { type Moment } from 'moment-timezone'
import type moment from 'moment-timezone'
import { TYPES } from '../../data-access/sql.service'
const sqlService = require('../../data-access/sql.service')

export interface PupilAuditSummary {
  id: number
  createdAt: Moment
  auditOperation: string
  user: string
}

export class ServiceManagerPupilDataService {
  static async findPupilByUpn (upn: string): Promise<PupilSearchResult[]> {
    const sql = `
      SELECT p.createdAt, p.foreName, p.lastName, p.middleNames, p.dateOfBirth,
        s.name as [schoolName], s.urn, s.dfeNumber, p.urlSlug, s.id as [schoolId],
        p.frozen
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
      SELECT p.createdAt, p.id, p.foreName, p.middleNames, p.lastName, p.dateOfBirth,
        s.name as [schoolName], s.urn, s.dfeNumber, p.urlSlug, p.upn, s.id as [schoolId],
        p.frozen, ac.code as [attendanceCode]
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

  static async getPupilAudits (pupilId: number): Promise<PupilAuditSummary[]> {
    const sql = `
      SELECT pa.id, pa.createdAt, aot.auditOperation,
        COALESCE(u.displayName, u.identifier, 'system') as [user]
      FROM mtc_admin.pupilAudit pa
      INNER JOIN mtc_admin.auditOperationTypeLookup aot ON aot.id = pa.auditOperationTypeLookup_id
      LEFT OUTER JOIN mtc_admin.[user] u ON u.id = pa.operationBy_userId
      WHERE pa.pupil_id = @pupilId
      ORDER BY pa.createdAt DESC, pa.id DESC`
    const params = [
      {
        name: 'pupilId',
        value: pupilId,
        type: TYPES.Int
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

  static async sqlMovePupilToSchool (pupilId: number, schoolId: number, userId: number): Promise<void> {
    console.log('sqlMovePupilToSchool() called')
    const sql = `
      UPDATE mtc_admin.pupil
      SET
        school_id = @schoolId,
        lastModifiedBy_userId = @userId
      WHERE
        id = @pupilId
    `
    const params = [
      { name: 'pupilId', value: pupilId, type: TYPES.Int },
      { name: 'schoolId', value: schoolId, type: TYPES.Int },
      { name: 'userId', value: userId, type: TYPES.Int }
    ]
    return sqlService.modify(sql, params)
  }
}

export interface PupilStatusData {
  id: number
  foreName: string
  lastName: string
  middleNames: string
  dateOfBirth: Moment
  group_id: number | null
  urlSlug: string
  school_id: number
  reason: string | null
  reasonCode: string | null
  attendanceId: number | null
  pupilCheckComplete: boolean
  currentCheckId: number | null
  pupilId: number
  restartAvailable: boolean
  checkReceived: boolean | null
  checkComplete: boolean | null
  processingFailed: boolean | null
  pupilLoginDate: Moment | null
  pinExpiresAt: Moment | null
}

export interface PupilSearchResult {
  createdAt: moment.Moment
  id: number
  urlSlug: string
  foreName: string
  lastName: string
  middleNames: string
  dateOfBirth: Moment
  schoolName: string
  urn: number
  dfeNumber: number
  upn: string
  schoolId: number
  attendanceCode: string
  frozen: boolean
}
