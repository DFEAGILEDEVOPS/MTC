import { IPupil } from './IPupil'

export interface ICheckAllocationDataService {
  getPupilsBySchoolUuid (schoolUUID: string): Promise<Array<IPupil>>
}
export class CheckAllocationDataService implements ICheckAllocationDataService {
  async getPupilsBySchoolUuid (schoolUUID: string): Promise<Array<IPupil>> {
    throw new Error('Method not implemented.')
  }
}
