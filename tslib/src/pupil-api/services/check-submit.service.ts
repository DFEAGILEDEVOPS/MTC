
export interface ICheckSubmitService {
  submit (data: any): Promise<void>
}

export class CheckSubmitService implements ICheckSubmitService {
  async submit (data: any): Promise<void> {
    throw new Error('Not implemented')
  }
}
