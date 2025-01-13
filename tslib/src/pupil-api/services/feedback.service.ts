export interface IPupilFeedbackService {
  putFeedbackOnQueue(payload: any): Promise<void>
}

export class PupilFeedbackService implements IPupilFeedbackService {
  async putFeedbackOnQueue (payload: any): Promise<void> {
    throw new Error('Not implemented')
  }
}
