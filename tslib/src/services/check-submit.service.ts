
export interface ICheckSubmitService {
  submit (payload: any): Promise<void>
}

export class CheckSubmitService {
  async submit (payload: any): Promise<void> {
    throw new Error('dispatch onto queue')
  }
}
