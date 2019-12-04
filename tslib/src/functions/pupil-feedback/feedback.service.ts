import v4 from 'uuid'

export interface IPupilFeedbackMessage {
  version: number
  checkCode: string
  inputType: string
  satisfactionRating: string
  comments: string
}

export interface IPupilFeedbackTableEntity {
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
    binding.feedbackTable = []
    const entity: IPupilFeedbackTableEntity = {
      PartitionKey: message.checkCode,
      RowKey: v4(),
      checkCode: message.checkCode,
      comments: message.comments,
      inputType: message.inputType,
      satisfactionRating: message.satisfactionRating
    }
    binding.feedbackTable.push(entity)
  }
}
