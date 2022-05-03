import XRegExp from 'xregexp'
import { ServiceManagerPupilDataService } from './service-manager.pupil.data.service'
const dateTimeService = require('../../date.service')

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
        dateOfBirth: dateTimeService.formatShortGdsDate(r.dateOfBirth),
        schoolName: r.schoolName,
        schoolUrn: r.urn,
        dfeNumber: r.dfeNumber
      }
    })
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
}
