
export class ServiceManagerPupilService {
  /**
   * @description utility function for javascript consumers
   * @returns {ServiceManagerPupilService} new instance of service
   */
  static createInstance(): ServiceManagerPupilService {
    return new ServiceManagerPupilService()
  }

  async findPupilByUpn (upn: string): Promise<ServiceManagerPupilSearchResult> {
    throw new Error('not implemented')
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
