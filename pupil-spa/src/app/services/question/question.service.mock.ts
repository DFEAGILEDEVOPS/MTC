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

  getConfig() {
    const config = new Config();
    config.loadingTime = 2;
    config.questionTime = 5;
    config.speechSynthesis = false;
    config.audibleSounds = true;
    return config;
  }

  reset() {
  }

  initialise() {
  }
}
