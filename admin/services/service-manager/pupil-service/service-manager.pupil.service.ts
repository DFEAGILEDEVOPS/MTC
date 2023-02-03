import XRegExp from 'xregexp'
import { ServiceManagerPupilDataService } from './service-manager.pupil.data.service'
import { validate } from 'uuid'
import moment from 'moment'
import { PupilAnnulmentDataService } from '../pupil-annulment/pupil-annulment.data.service'
const dateService = require('../../date.service')
const settingService = require('../../setting.service')
const pupilStatusService = require('../../pupil-status.service')

export class ServiceManagerPupilService {
  private static readonly alphaNumericRegexPattern = '^[a-zA-Z0-9]+$'

  static async findPupilByUpn (upn: string): Promise<ServiceManagerPupilSearchResult[]> {
    if (upn === undefined || upn === '') throw new Error('upn is required')
    if (upn.length !== 13) throw new Error('upn should be 13 characters and numbers')
    if (!XRegExp(this.alphaNumericRegexPattern).test(upn)) {
      throw new Error('upn should only contain alphanumeric characters')
    }
    const results = await ServiceManagerPupilDataService.findPupilByUpn(upn.toUpperCase())
    if (results === undefined) return []
    return results.map(r => {
      return {
        createdAt: dateService.formatShortGdsDate(r.createdAt),
        urlSlug: r.urlSlug,
        id: r.id,
        firstName: r.foreName,
        lastName: r.lastName,
        middleNames: r.middleNames,
        dateOfBirth: dateService.formatShortGdsDate(r.dateOfBirth),
        schoolName: r.schoolName,
        schoolUrn: r.urn,
        dfeNumber: r.dfeNumber,
        upn: r.upn,
        schoolId: r.schoolId
      }
    })
  }

  static async getPupilDetailsByUrlSlug (urlSlug: string): Promise<ServiceManagerPupilDetails> {
    if (!validate(urlSlug)) {
      throw new Error(`${urlSlug} is not a valid UUID`)
    }
    const p = await ServiceManagerPupilDataService.getPupilByUrlSlug(urlSlug)
    if (p.length === 0) throw new Error(`no pupil found with specified urlSlug '${urlSlug}'`)

    const status = await this.getPupilStatus(p[0].id)
    const isAnnulled = p[0].attendanceCode === PupilAnnulmentDataService.annulmentCode

    return {
      dateOfBirth: dateService.formatShortGdsDate(moment(p[0].dateOfBirth)),
      dfeNumber: p[0].dfeNumber,
      firstName: p[0].foreName,
      id: p[0].id,
      lastName: p[0].lastName,
      middleNames: p[0].middleNames,
      schoolName: p[0].schoolName,
      schoolUrn: p[0].urn,
      urlSlug: p[0].urlSlug,
      upn: p[0].upn,
      status,
      schoolId: p[0].schoolId,
      isAnnulled
    }
  }

  static async movePupilToSchool (pupilId: number, schoolId: number, userId: number): Promise<void> {
    console.log('movePupilToSchool() called')
    if (pupilId === undefined) {
      throw new Error('Missing pupilId')
    }
    if (schoolId === undefined) {
      throw new Error('Missing schoolId')
    }
    if (userId === undefined) {
      throw new Error('Missing user ID')
    }
    await ServiceManagerPupilDataService.sqlMovePupilToSchool(pupilId, schoolId, userId)
  }

  private static async getPupilStatus (pupilId: number): Promise<any> {
    const pupilData = await ServiceManagerPupilDataService.getPupilStatusData(pupilId)
    if (pupilData.length === 0) return ''
    const settingData = await settingService.get()
    const pupilStatus = pupilStatusService.addStatus(settingData, pupilData[0])
    return pupilStatus.status
  }
}

export interface ServiceManagerPupilSearchResult {
  createdAt: string
  urlSlug: string
  id: number
  firstName: string
  lastName: string
  middleNames: string
  dateOfBirth: string
  schoolName: string
  schoolUrn: number
  dfeNumber: number
  upn: string
  schoolId: number
}

export interface ServiceManagerPupilDetails {
  urlSlug: string
  id: number
  firstName: string
  lastName: string
  middleNames: string
  dateOfBirth: string
  schoolName: string
  schoolUrn: number
  dfeNumber: number
  upn: string
  status: string
  schoolId: number
  isAnnulled: boolean
}
