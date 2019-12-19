import { Injectable } from '@angular/core';
import { QuestionService } from './question.service';

import { StorageService } from '../storage/storage.service';
import { SpeechService } from '../speech/speech.service';
import { Config } from '../../config.model';
import { ConfigStorageKey } from '../storage/storageKey';

@Injectable()
export class WarmupQuestionService extends QuestionService {

  private questionData = [
    {
      'order': 1,
      'factor1': 1,
      'factor2': 12
    },
    {
      'order': 2,
      'factor1': 2,
      'factor2': 2
    },
    {
      'order': 3,
      'factor1': 10,
      'factor2': 10
    }
  ];

  constructor(protected storageService: StorageService,
              protected speechService: SpeechService) {
    super(storageService, speechService);
    // re-initialise on page refresh
    if (this.storageService.getItem(new ConfigStorageKey())) {
      this.initialise();
    }
  }

  initialise() {
    this.questions = this.questionData;
    const configData = this.storageService.getItem(new ConfigStorageKey());
    const config = new Config();
    config.loadingTime = configData[ 'loadingTime' ];
    config.questionTime = configData[ 'questionTime' ];
    config.checkTime = configData[ 'checkTime' ];
    config.questionReader = configData['questionReader'] && this.speechService.isSupported();
    config.audibleSounds = configData[ 'audibleSounds' ];
    config.numpadRemoval = configData[ 'numpadRemoval' ];
    config.fontSize = configData[ 'fontSize' ];
    config.colourContrast = configData[ 'colourContrast' ];
    config.practice = configData[ 'practice' ];
    this.config = config;
  }
}
