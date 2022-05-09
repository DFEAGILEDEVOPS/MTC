import XRegExp from 'xregexp'
import { ServiceManagerPupilDataService } from './service-manager.pupil.data.service'
const dateService = require('../../date.service')
import { validate } from 'uuid'
import moment from 'moment'
import R from 'ramda'
const settingService = require('../../setting.service')
const pupilStatusService = require('../../pupil-status.service')

export class ServiceManagerPupilService {

  private static alphaNumericRegexPattern = `^[a-zA-Z0-9]+$`

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
        urlSlug: r.urlSlug,
        id: r.id,
        firstName: r.foreName,
        lastName: r.lastName,
        dateOfBirth: dateService.formatShortGdsDate(r.dateOfBirth),
        schoolName: r.schoolName,
        schoolUrn: r.urn,
        dfeNumber: r.dfeNumber,
        upn: r.upn
      }
    })
  }

  static async getPupilDetailsByUrlSlug (urlSlug: string): Promise<ServiceManagerPupilDetails> {
    if (!validate(urlSlug)) {
      throw new Error(`${urlSlug} is not a valid UUID`)
    }
    const p = await ServiceManagerPupilDataService.getPupilByUrlSlug(urlSlug)
    if (p.length === 0) return undefined

    const status = await this.getPupilStatus(p[0].id)

    return {
      dateOfBirth: dateService.formatShortGdsDate(moment(p[0].dateOfBirth)),
      dfeNumber: p[0].dfeNumber,
      firstName: p[0].foreName,
      id: p[0].id,
      lastName: p[0].lastName,
      schoolName: p[0].schoolName,
      schoolUrn: p[0].urn,
      urlSlug: p[0].urlSlug,
      upn: p[0].upn,
      attendance: p[0].attendanceReason ?? '',
      status: status
    }
  }

  private static async getPupilStatus (pupilId: number): Promise<any> {
    const pupilData = await ServiceManagerPupilDataService.getPupilStatusData(pupilId)
    const settingData = await settingService.get()
    const pupilStatus = pupilStatusService.addStatus(settingData, pupilData)
    return pupilStatus.status
  }
}

export interface ServiceManagerPupilSearchResult {
  urlSlug: string
  id: number
  firstName: string
  lastName: string
  dateOfBirth: string
  schoolName: string
  schoolUrn: number
  dfeNumber: number
  upn: string
}

export interface ServiceManagerPupilDetails {
  urlSlug: string
  id: number
  firstName: string
  lastName: string
  dateOfBirth: string
  schoolName: string
  schoolUrn: number
  dfeNumber: number
  upn: string
  attendance: string
  status: string
}
