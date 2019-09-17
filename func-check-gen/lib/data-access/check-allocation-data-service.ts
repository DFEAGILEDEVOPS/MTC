export interface ICheckAllocationDataService {
  getAllPupilData (excludeUnusedAllocations: boolean): Array<any>
}

export class CheckAllocationDataService implements ICheckAllocationDataService {
  getAllPupilData (excludeUnusedAllocations: boolean): any[] {
    throw new Error('Method not implemented.')
  }
}
