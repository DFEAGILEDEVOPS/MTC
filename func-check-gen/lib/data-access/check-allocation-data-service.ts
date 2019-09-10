export interface ICheckAllocationDataService {
  getAllPupilData (): Array<any>
}

export class CheckAllocationDataService implements ICheckAllocationDataService {
  getAllPupilData (): any[] {
    throw new Error('Method not implemented.')
  }
}
