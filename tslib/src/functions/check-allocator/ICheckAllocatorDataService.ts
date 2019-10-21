import { IPupil } from './IPupil'

export interface ICheckAllocationDataService {
  /**
   * @description fetches all pupils within a particular school
   * @param schoolUUID the urlSlug of the school
   * @returns an array of pupils within the school
   */
  getPupilsBySchoolUuid (schoolUUID: string): Promise<Array<IPupil>>
}
export class CheckAllocationDataService implements ICheckAllocationDataService {
  async getPupilsBySchoolUuid (schoolUUID: string): Promise<Array<IPupil>> {
    throw new Error('Method not implemented.')
  }
}
