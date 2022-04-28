import moment from 'moment-timezone'
import XRegExp from 'xregexp'
import { IServiceManagerPupilDataService, ServiceManagerPupilDataService } from './service-manager.pupil.data.service'

  /**
   * @description utility function for javascript consumers
   * @returns {ServiceManagerPupilService} new instance of service
   */
  export const createInstance = (dataService?: IServiceManagerPupilDataService): ServiceManagerPupilService => {
    return new ServiceManagerPupilService(dataService)
  }

export class ServiceManagerPupilService {

  private dataService: IServiceManagerPupilDataService

  constructor (dataService?: IServiceManagerPupilDataService) {
    this.dataService = dataService ?? new ServiceManagerPupilDataService()
  }

  private alphaNumericRegexPattern = `^[a-zA-Z0-9]+$`

  async findPupilByUpn (upn: string): Promise<ServiceManagerPupilSearchResult[]> {
    if (upn === undefined || upn === '') throw new Error('upn is required')
    if (upn.length !== 13) throw new Error('upn should be 13 characters and numbers')
    if (!XRegExp(this.alphaNumericRegexPattern).test(upn)) {
      throw new Error('upn should only contain alphanumeric characters')
    }
    const results = await this.dataService.findPupilByUpn(upn.toUpperCase())
    if (results === undefined) return []
    return results.map(r => {
      return {
        urlSlug: r.urlSlug,
        id: r.id,
        firstName: r.foreName,
        lastName: r.lastName,
        dateOfBirth: moment(r.dateOfBirth).toISOString(),
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
