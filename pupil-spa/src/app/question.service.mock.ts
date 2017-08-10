import { Question } from './question.model';
import { Config } from './config.model';

export class QuestionServiceMock {

  constructor() {
  }

  getNumberOfQuestions() {
    return 10;
  }

  getQuestion() {
    return new Question(3, 4, 1);
  }

  getNextQuestionNumber() {
    return 2;
  }

  getConfig() {
    const config = new Config();
    config.loadingTime = 2;
    config.questionTime = 5;
    return config;
  }

  reset() {
  }

  initialise() {
  }
};