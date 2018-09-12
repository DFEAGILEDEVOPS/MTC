import { Injectable } from '@angular/core';
import { QuestionService } from './question.service';

import { StorageService } from '../storage/storage.service';
import { SpeechService } from '../speech/speech.service';
import { Config } from '../../config.model';
const configKey = 'config';

@Injectable()
export class WarmupQuestionService extends QuestionService {

  questions = [
    {
      'order': 1,
      'factor1': 1,
      'factor2': 8
    },
    {
      'order': 2,
      'factor1': 2,
      'factor2': 6
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
  }
}
