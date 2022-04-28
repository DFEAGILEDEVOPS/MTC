import XRegExp from 'xregexp'
import { IServiceManagerPupilDataService, ServiceManagerPupilDataService } from './service-manager.pupil.data.service'

export class ServiceManagerPupilService {
  /**
   * @description utility function for javascript consumers
   * @returns {ServiceManagerPupilService} new instance of service
   */
  static createInstance(dataService?: IServiceManagerPupilDataService): ServiceManagerPupilService {
    return new ServiceManagerPupilService(dataService)
  }

  private dataService: IServiceManagerPupilDataService

  constructor (dataService?: IServiceManagerPupilDataService) {
    this.dataService = dataService ?? new ServiceManagerPupilDataService()
  }

  private alphaNumericRegexPattern = `^[a-zA-Z0-9]+$`

  async findPupilByUpn (upn: string): Promise<ServiceManagerPupilSearchResult> {
    if (upn === undefined || upn === '') throw new Error('upn is required')
    if (upn.length !== 13) throw new Error('upn should be 13 characters and numbers')
    if (!XRegExp(this.alphaNumericRegexPattern).test(upn)) {
      throw new Error('upn should only contain alphanumeric characters')
    }
    const result = await this.dataService.findPupilByUpn(upn)
    //TODO map to object
    return result
  }
}

export interface ServiceManagerPupilSearchResult {
  id: number
  firstName: string
  lastName: string
  dateOfBirth: string
  schoolName: string
  schoolUrn: number
  dfeNumber: number
}
