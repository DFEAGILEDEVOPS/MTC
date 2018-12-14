import { Question } from './question.model';
import { Config } from '../../config.model';

export class QuestionServiceMock {

  constructor() {
  }

  getCurrentQuestionNumber() {
    return 1;
  }

  getNumberOfQuestions() {
    return 10;
  }

  getQuestion() {
    return new Question(3, 4, 1);
  }

  public setCheckStartTime() {
  }

  public getTimeSinceCheckStarted(): number {
    return 300000;
  }

  public getCheckTimeRemaining(): number {
    return 1500000;
  }

  getConfig() {
    const config = new Config();
    config.loadingTime = 2;
    config.questionTime = 5;
    config.checkTime = 30;
    config.questionReader = false;
    config.audibleSounds = false;
    config.inputAssistance = false;
    return config;
  }

  reset() {
  }

  initialise() {
  }
}
