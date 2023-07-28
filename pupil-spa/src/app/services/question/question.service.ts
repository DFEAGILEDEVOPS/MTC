import { Injectable } from '@angular/core';
import { Question } from './question.model';

import { StorageService } from '../storage/storage.service';
import { SpeechService } from '../speech/speech.service';

import { Config } from '../../config.model';

@Injectable()
export class QuestionService {

  protected currentQuestion: number;
  protected questions: Array<any>;
  protected config: Config;

  constructor(protected storageService: StorageService,
              protected speechService: SpeechService) {
    this.currentQuestion = 0;

    // Re-read the stored questions on page refresh
    if (this.storageService.getQuestions() && this.storageService.getConfig()) {
      this.initialise();
    }
  }

  public getNumberOfQuestions(): number {
    try {
      return this.questions.length;
    } catch (error) {
      return 0;
    }
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
    const questionData = this.storageService.getQuestions();
    const configData = this.storageService.getConfig();
    this.questions = questionData;
    const config = new Config();
    config.loadingTime = configData[ 'loadingTime' ];
    config.questionTime = configData[ 'questionTime' ];
    config.checkTime = configData[ 'checkTime' ];
    config.questionReader = configData['questionReader'] && this.speechService.isSupported();
    config.audibleSounds = configData[ 'audibleSounds' ];
    config.inputAssistance = configData[ 'inputAssistance' ];
    config.numpadRemoval = configData[ 'numpadRemoval' ];
    config.fontSize = configData[ 'fontSize' ];
    config.colourContrast = configData[ 'colourContrast' ];
    config.practice = configData[ 'practice' ];
    config.nextBetweenQuestions = configData[ 'nextBetweenQuestions' ];
    this.config = config;
  }
}
