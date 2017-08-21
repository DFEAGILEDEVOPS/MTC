import { TestBed, inject } from '@angular/core/testing';

import { RegisterInputService} from './registerInput.service';
import { StorageService } from './storage.service';
import { QuestionService} from './question.service';

describe('RegisterInputService', () => {

  let mockStorageService;

  beforeEach(() => {
    mockStorageService = {
      getItem() {
      },
      setItem() {
      }
    };

    TestBed.configureTestingModule({
      providers: [
        RegisterInputService,
        QuestionService,
        {provide: StorageService, useValue: mockStorageService}
      ]
    });
    const service = RegisterInputService;

    this.questionInputs = [];
    this.currentQuestion = 1;
  });

  it('should be created', inject([RegisterInputService], (service: RegisterInputService) => {
    expect(service).toBeTruthy();
  }));
})
