import { IFeedbackService } from './feedback.service';

export class FeedbackServiceMock implements IFeedbackService {
  async postFeedback() {}
  async queueSubmit(payload: Object) {}
}
