import { v4 as uuidv4 } from 'uuid'

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
  feedbackTable: any[]
}

export class PupilFeedbackService {
  process (message: IPupilFeedbackMessage): IPupilFeedbackFunctionBinding {
    if (message.version !== 2) {
      throw new Error(`version:${message.version} unsupported`)
    }
    const output: IPupilFeedbackFunctionBinding = {
      feedbackTable: []
    }

    const entity: IPupilFeedbackTableEntity = {
      PartitionKey: message.checkCode,
      RowKey: uuidv4(),
      checkCode: message.checkCode,
      comments: message.comments,
      inputType: message.inputType,
      satisfactionRating: message.satisfactionRating
    }
    output.feedbackTable.push(entity)
    return output
  }
}
