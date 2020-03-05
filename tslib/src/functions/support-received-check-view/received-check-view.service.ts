
export class ReceivedCheckViewService {
  async get (functionBinding: IReceivedCheckViewFunctionBinding): Promise<ReceivedCheckView | undefined> {
    if (functionBinding.receivedCheck === undefined) {
      return undefined
    }
    throw new Error('not implemented')
  }
}

export interface IReceivedCheckViewFunctionBinding {
  receivedCheck: any | undefined
}

export interface ReceivedCheckView {
  checkCode: string
}
