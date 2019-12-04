
export interface IPupilFeedbackMessage {
  version: number
  PartitionKey: string
  RowKey: string
  checkCode: string
  inputType: string
  satisfactionRating: string
  comments: string
}

export interface IPupilFeedbackFunctionBinding {
  feedbackTable: Array<any>
}

export class PupilFeedbackService {
  process (binding: IPupilFeedbackFunctionBinding, message: IPupilFeedbackMessage): void {
    if (message.version !== 2) {
      throw new Error(`version:${message.version} unsupported`)
    }
  }
}
