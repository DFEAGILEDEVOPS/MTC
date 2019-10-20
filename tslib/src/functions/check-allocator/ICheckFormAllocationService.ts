export interface ICheckFormAllocationService {
  allocate (pupilId: number): Promise<any>
}
export class CheckFormAllocationService implements ICheckFormAllocationService {
  allocate (pupilId: number): Promise<any> {
    return Promise.reject(new Error('not implemented'))
  }
}
