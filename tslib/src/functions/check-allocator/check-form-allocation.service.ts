
export interface ICheckFormAllocationService {
  allocate (pupilId: number): Promise<number>
}

export class CheckFormAllocationService implements ICheckFormAllocationService {
  async allocate (pupilId: number): Promise<number> {
    throw new Error('not implemented')
  }
}
