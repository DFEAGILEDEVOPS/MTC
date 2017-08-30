import { TestBed, inject } from '@angular/core/testing';

import { WarmupQuestionService } from './warmup-question.service';
import { StorageService } from '../storage/storage.service';

describe('WarmupQuestionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StorageService,
        WarmupQuestionService
      ]
    });
  });

  it('should be created', inject([ WarmupQuestionService ], (service: WarmupQuestionService) => {
    expect(service).toBeTruthy();
  }));
});
