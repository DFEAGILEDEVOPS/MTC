import { Context } from '@azure/functions'

export interface IPupilFeedbackMessage {
  version: number
  PartitionKey: string
  RowKey: string
  checkCode: string
  inputType: string
  satisfactionRating: string
  comments: string
}

export class PupilFeedbackService {
  process (context: Context, message: IPupilFeedbackMessage): void {
    throw new Error('impl')
  }
}
