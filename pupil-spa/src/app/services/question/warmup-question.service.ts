import { Injectable } from '@angular/core';
import { QuestionService } from './question.service';

import { StorageService } from '../storage/storage.service';
import { SpeechService } from '../speech/speech.service';
import { Config } from '../../config.model';
const configKey = 'config';

@Injectable()
export class WarmupQuestionService extends QuestionService {

  private questionData = [
    {
      'order': 1,
      'factor1': 1,
      'factor2': 7
    },
    {
      'order': 2,
      'factor1': 3,
      'factor2': 10
    },
    {
      'order': 3,
      'factor1': 2,
      'factor2': 6
    }
  ];

  constructor(protected storageService: StorageService,
              protected speechService: SpeechService) {
    super(storageService, speechService);
    // re-initialise on page refresh
    if (this.storageService.getItem(configKey)) {
      this.initialise();
    }
  }

  initialise() {
    this.questions = this.questionData;
    const configData = this.storageService.getItem(configKey);
    const config = new Config();
    config.loadingTime = configData[ 'loadingTime' ];
    config.questionTime = configData[ 'questionTime' ];
    config.questionReader = configData['questionReader'] && this.speechService.isSupported();
    config.audibleSounds = configData[ 'audibleSounds' ];
    config.numpadRemoval = configData[ 'numpadRemoval' ];
    config.fontSize = configData[ 'fontSize' ];
    config.colourContrast = configData[ 'colourContrast' ];
    config.practice = configData[ 'practice' ];
    this.config = config;
  }
}
