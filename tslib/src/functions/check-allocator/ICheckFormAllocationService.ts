export interface ICheckFormAllocationService {
  allocate (pupilId: number): any
}
export class CheckFormAllocationService implements ICheckFormAllocationService {
  allocate (pupilId: number): any {
    throw new Error('not implemented')
  }
}
