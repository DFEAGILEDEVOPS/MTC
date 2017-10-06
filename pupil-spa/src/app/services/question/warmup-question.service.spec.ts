import { TestBed, inject } from '@angular/core/testing';

import { WarmupQuestionService } from './warmup-question.service';
import { StorageService } from '../storage/storage.service';

let storageService;
const config = {
  loadingTime: 2,
  questionTime: 5
};

describe('WarmupQuestionService', () => {
  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [
        StorageService,
        WarmupQuestionService
      ]
    });
    storageService = injector.get(StorageService);
    spyOn(storageService, 'getItem').and.returnValue(config);
  });

  it('should be created', inject([ WarmupQuestionService ], (service: WarmupQuestionService) => {
    expect(service).toBeTruthy();
  }));

  it('should initialise correctly', inject([ WarmupQuestionService ], (service: WarmupQuestionService) => {
    expect(service[ 'questions' ]).toBeDefined();
    expect(service[ 'config' ]).toBeDefined();
  }));
});
