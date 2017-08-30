import { TestBed, inject } from '@angular/core/testing';

import { WarmupQuestionService } from './warmup-question.service';

describe('WarmupQuestionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WarmupQuestionService]
    });
  });

  it('should be created', inject([WarmupQuestionService], (service: WarmupQuestionService) => {
    expect(service).toBeTruthy();
  }));
});
