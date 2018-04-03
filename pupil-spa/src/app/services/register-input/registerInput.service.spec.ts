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
  const questionNumber = 3;

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
      service.storeEntry(eventValue, eventType, questionNumber);
      expect(mockStorageService.setItem).toHaveBeenCalledTimes(1);
    }));

  it('StoreEntry will timestamp the input',
    inject([TestRegisterInputService], (service: TestRegisterInputService) => {
      const eventValue = '1';
      const eventType = 'keydown';
      service.storeEntry(eventValue, eventType, questionNumber);
      const args = mockStorageServiceSpy.calls.first().args;
      const record = args[1][0];
      expect(record.hasOwnProperty('clientTimestamp')).toBeTruthy();
      expect(record.clientTimestamp instanceof Date).toBe(true)
    }));

  it('AddEntry to call StoreEntry', inject([TestRegisterInputService], (service: TestRegisterInputService) => {
    spyOn(service, 'storeEntry');
    const event = {type: 'keydown', key: 'f'};
    service.addEntry(event, questionNumber);
    expect(service.storeEntry).toHaveBeenCalledTimes(1);
  }));

  it('expects a left click event to be registered',
    inject([TestRegisterInputService], (service: TestRegisterInputService) => {
      const event = {type: 'mousedown', which: 1};
      service.addEntry(event, questionNumber);
      expect(mockStorageService.setItem).toHaveBeenCalledTimes(1);
      const args = mockStorageServiceSpy.calls.first().args;
      const record = args[1][0];
      expect(record['input']).toBe('left click');
    }));

  it('calls the storage service', inject([TestRegisterInputService],
    (registerInputService: TestRegisterInputService) => {
      const event = {type: 'mousedown', which: 1};
      registerInputService.addEntry(event, questionNumber);
      registerInputService.addEntry(event, questionNumber);
      expect(mockStorageService.setItem).toHaveBeenCalledTimes(2);
    }));
});
