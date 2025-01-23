import { IFeedbackService } from './feedback.service';

export class FeedbackServiceMock implements IFeedbackService {
  async postFeedback(): Promise<boolean> { return true }
  async submitFeedback(payload: Object): Promise<void> { return }
}
