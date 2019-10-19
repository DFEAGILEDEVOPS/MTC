import { IPupil } from "./IPupil"

export interface ICheckAllocatorDataService {
  getPupilsBySchoolUuid (schoolUUID: string): Promise<Array<IPupil>>
}
export class CheckAllocatorDataService implements ICheckAllocatorDataService {
  async getPupilsBySchoolUuid (schoolUUID: string): Promise<Array<IPupil>> {
    throw new Error('Method not implemented.')
  }
}
