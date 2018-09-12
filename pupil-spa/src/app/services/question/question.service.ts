import { Injectable } from '@angular/core';
import { Question } from './question.model';

import { StorageService } from '../storage/storage.service';
import { SpeechService } from '../speech/speech.service';

import { Config } from '../../config.model';
const questionKey = 'questions';
const configKey = 'config';

@Injectable()
export class QuestionService {

  protected currentQuestion;
  protected config;

  protected questions = [
    {'order': 1, 'factor1': 2, 'factor2': 4},
    {'order': 2, 'factor1': 9, 'factor2': 3},
    {'order': 3, 'factor1': 11, 'factor2': 5},
    {'order': 4, 'factor1': 6, 'factor2': 8},
    {'order': 5, 'factor1': 12, 'factor2': 12}
  ];

  constructor(protected storageService: StorageService,
              protected speechService: SpeechService) {
    this.currentQuestion = 0;

    const config = new Config();
    config.loadingTime = 3;
    config.questionTime = 6;
    config.speechSynthesis = false;
    config.audibleSounds = false;
    config.warmupLoadingTime = 3;

    this.config = config;
  }

  public getNumberOfQuestions(): number {
    return this.questions.length;
  }

  public getCurrentQuestionNumber(): number {
    return this.currentQuestion;
  }

  public getQuestion(sequenceNumber: number): Question {
    // The Number type in Typescript is a float, so this could be a decimal.
    if (!Number.isInteger(sequenceNumber)) {
      throw new Error('sequenceNumber is not an integer');
    }

    const data = this.questions[sequenceNumber - 1];
    const last = this.getNumberOfQuestions();

    // Bounds check
    if (sequenceNumber > last || sequenceNumber < 0) {
      throw new Error(`Out of range: question ${sequenceNumber} does not exist`);
    }

    // The registered input service needs to know which question we are on.
    this.currentQuestion = sequenceNumber;

    const question = new Question(
      data['factor1'],
      data['factor2'],
      sequenceNumber
    );

    return question;
  }

  getConfig() {
    return this.config;
  }

  reset() {
    this.questions = null;
    this.config = null;
  }
}
