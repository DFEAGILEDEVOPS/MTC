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
  protected questions;
  protected config: Config;

  constructor(protected storageService: StorageService,
              protected speechService: SpeechService) {
    this.currentQuestion = 0;

    // Re-read the stored questions on page refresh
    if (this.storageService.getItem(questionKey) && this.storageService.getItem(configKey)) {
      this.initialise();
    }
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

  initialise() {
    const questionData = this.storageService.getItem(questionKey);
    const configData = this.storageService.getItem(configKey);
    this.questions = questionData;
    const config = new Config();
    config.loadingTime = configData[ 'loadingTime' ];
    config.questionTime = configData[ 'questionTime' ];
    config.speechSynthesis = configData['speechSynthesis'] && this.speechService.isSupported();
    config.audibleSounds = configData[ 'audibleSounds' ];
    config.numpadRemoval = configData[ 'numpadRemoval' ];
    config.fontSize = configData[ 'fontSize' ];
    config.colourContrast = configData[ 'colourContrast' ];
    this.config = config;
  }
}
