import { ServiceManagerSchoolDataService, type ServiceManagerSchoolResult } from './school.data.service'

export class ServiceManagerSchoolService {
  static async findSchoolByUrn (urn: number): Promise<ServiceManagerSchoolResult> {
    if (urn === undefined) {
      throw new Error('URN not provided')
    }
    return ServiceManagerSchoolDataService.sqlFindSchoolByUrn(urn)
  }

  static async findSchoolBySlug (slug: string): Promise<ServiceManagerSchoolResult> {
    if (slug === undefined || slug === '') {
      throw new Error('School URL slug not provided')
    }
    return ServiceManagerSchoolDataService.sqlFindSchoolBySlug(slug)
  }
}
