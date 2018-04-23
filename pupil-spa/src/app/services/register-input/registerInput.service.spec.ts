import { Injectable } from '@angular/core';
import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { StorageServiceMock } from '../storage/storage.service.mock';
import { QuestionServiceMock } from '../question/question.service.mock';
import { RegisterInputService } from './registerInput.service';
import { StorageService } from '../storage/storage.service';
import { QuestionService } from '../question/question.service';
import { SubmissionService } from '../submission/submission.service';

let mockStorageService: StorageServiceMock;
let mockQuestionService: QuestionServiceMock;

@Injectable()
export class TestRegisterInputService extends RegisterInputService {

  constructor(protected storageService: StorageService, protected questionService: QuestionService) {
    super(storageService, questionService);
  }
}

describe('RegisterInputService', () => {
  let mockStorageServiceSpy;

  beforeEach(() => {
    mockStorageService = new StorageServiceMock();
    mockQuestionService = new QuestionServiceMock();
    mockStorageServiceSpy = spyOn(mockStorageService, 'setItem');

    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        TestRegisterInputService,
        SubmissionService,
        {provide: QuestionService, useValue: mockQuestionService},
        {provide: StorageService, useValue: mockStorageService}
      ]
    });
  });

  it('should be created', inject([TestRegisterInputService], (service: TestRegisterInputService) => {
    expect(service).toBeTruthy();
  }));

  it('StoreEntry will populate the questionInputs array',
    inject([TestRegisterInputService], (service: TestRegisterInputService) => {
      const eventValue = '0';
      const eventType = 'keydown';
      service.storeEntry(eventValue, eventType, 7, '2x3');
      expect(mockStorageService.setItem).toHaveBeenCalledTimes(1);
    }));

  it('AddEntry to call StoreEntry', inject([TestRegisterInputService], (service: TestRegisterInputService) => {
    spyOn(service, 'storeEntry');
    const event = {type: 'keydown', key: 'f'};
    service.addEntry(event, {sequenceNumber: 1, question: '1x3'});
    expect(service.storeEntry).toHaveBeenCalledTimes(1);
  }));

  it('expects a left click event to be registered',
    inject([TestRegisterInputService], (service: TestRegisterInputService) => {
      const event = {
        type: 'mousedown', which: 1, target: {
          attributes: {
            'data-sequence-number': { value: '1' },
            'data-factor1': { value: '1' },
            'data-factor2': { value: '2' }
          }
        }
      };
      service.addEntry(event);
      expect(mockStorageService.setItem).toHaveBeenCalledTimes(1);
      const args = mockStorageServiceSpy.calls.first().args;
      const record = args[1][0][0];
      expect(record['input']).toBe('left click');
    }));

  it('calls the storage service', inject([TestRegisterInputService],
    (registerInputService: TestRegisterInputService) => {
      const event = {
        type: 'mousedown', which: 1, target: {
          attributes: {
            'data-sequence-number': { value: '1' },
            'data-factor1': { value: '1' },
            'data-factor2': { value: '2' }
          }
        }
      };
      registerInputService.addEntry(event);
      registerInputService.addEntry(event);
      expect(mockStorageService.setItem).toHaveBeenCalledTimes(2);
    }));
});
