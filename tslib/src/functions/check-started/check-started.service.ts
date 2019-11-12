export class CheckStartedService {
  async process (): Promise<void> {
    throw new Error('not implemented')
  }
}
export interface ICheckStartedMessage {
  version: number
  checkCode: string
  clientCheckStartedAt: Date
}
