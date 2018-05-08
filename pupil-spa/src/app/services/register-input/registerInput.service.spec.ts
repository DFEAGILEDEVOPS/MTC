import { Injectable } from '@angular/core';
import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { QuestionServiceMock } from '../question/question.service.mock';
import { RegisterInputService } from './registerInput.service';
import { StorageService } from '../storage/storage.service';
import { StorageServiceMock } from '../storage/storage.service.mock';
import { SubmissionService } from '../submission/submission.service';

let mockStorageService: StorageServiceMock;
let mockQuestionService: QuestionServiceMock;

@Injectable()
export class TestRegisterInputService extends RegisterInputService {

  constructor(protected storageService: StorageService) {
    super(storageService);
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
    const event = {type: 'keydown', key: 'f', currentTarget: null};
    service.addEntry(event);
    expect(service.storeEntry).toHaveBeenCalledTimes(1);
  }));

  it('expects a left click event to be registered',
    inject([TestRegisterInputService], (service: TestRegisterInputService) => {
      const event = {
        type: 'mousedown', which: 1, currentTarget: null
      };
      service.addEntry(event);
      expect(mockStorageService.setItem).toHaveBeenCalledTimes(1);
      const args = mockStorageServiceSpy.calls.first().args;
      // This `100` is tied to the missing question data,
      // registeredInputService line 55, where the `idx` is set to 100 if the
      // question data is missing.  It's missing here as the currentTarget on the event
      // is not set.
      const record = args[1][0];
      expect(record['input']).toBe('left click');
    }));

  it('calls the storage service', inject([TestRegisterInputService],
    (registerInputService: TestRegisterInputService) => {
      const event = {
        type: 'mousedown', which: 1, currentTarget: null
      };
      registerInputService.addEntry(event);
      registerInputService.addEntry(event);
      expect(mockStorageService.setItem).toHaveBeenCalledTimes(2);
    }));
});
