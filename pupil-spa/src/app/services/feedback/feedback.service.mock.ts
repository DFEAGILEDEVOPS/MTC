import { IFeedbackService } from './feedback.service';

export class FeedbackServiceMock implements IFeedbackService {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  async postFeedback(): Promise<boolean> { return true }
  async queueSubmit(payload: object): Promise<void> { return }
}
