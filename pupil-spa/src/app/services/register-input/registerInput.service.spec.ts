import { Injectable } from '@angular/core';
import { TestBed, inject } from '@angular/core/testing';

import { QuestionServiceMock } from '../question/question.service.mock';
import { RegisterInputService } from './registerInput.service';
import { StorageService } from '../storage/storage.service';

let mockQuestionService: QuestionServiceMock;
let storageService: StorageService;

@Injectable()
export class TestRegisterInputService extends RegisterInputService {

  constructor(protected storageService: StorageService) {
    super(storageService);
  }
}

describe('RegisterInputService', () => {
  let storageServiceSetInputSpy;
  beforeEach(() => {
    mockQuestionService = new QuestionServiceMock();
    const injector = TestBed.configureTestingModule({
      imports: [],
      providers: [
        TestRegisterInputService,
        StorageService,
      ]
    });
    storageService = injector.get(StorageService);
    storageServiceSetInputSpy = spyOn(storageService, 'setInput');
  });

  it('should be created', inject([TestRegisterInputService], (service: TestRegisterInputService) => {
    expect(service).toBeTruthy();
  }));

  it('StoreEntry will call localstorage and store with a unique key name',
    inject([TestRegisterInputService], (service: TestRegisterInputService) => {
      const eventValue = '0';
      const eventType = 'keydown';
      service.storeEntry(eventValue, eventType, 7, '2x3');
      expect(storageServiceSetInputSpy).toHaveBeenCalledTimes(1);
    }));
  it('StoreEntry to should store entry',
    inject([TestRegisterInputService], (service: TestRegisterInputService) => {
      const entry = {
        input: '0',
        eventType: 'keydown',
        clientTimestamp: new Date(),
        question: '2x3',
        sequenceNumber: 7,
      };
      service.storeEntry(entry.input, entry.eventType, entry.sequenceNumber, entry.question );
      expect(storageServiceSetInputSpy).toHaveBeenCalledTimes(1);
      expect(storageServiceSetInputSpy.calls.all()[0].args[0]).toEqual(entry);
    }));

  it('AddEntry to call StoreEntry', inject([TestRegisterInputService], (service: TestRegisterInputService) => {
    spyOn(service, 'storeEntry');
    const event = {type: 'keydown', key: 'f', currentTarget: null};
    service.addEntry(event);
    expect(service.storeEntry).toHaveBeenCalledTimes(1);
  }));

  it('expects a left click event to be registered',
    inject([TestRegisterInputService], (service: TestRegisterInputService) => {
      const spy = spyOn(service, 'storeEntry');
      const event = {
        type: 'mousedown', which: 1, currentTarget: null
      };
      service.addEntry(event);
      expect(service.storeEntry).toHaveBeenCalledTimes(1);
      const args = spy.calls.first().args;
      const eventType = args[0];
      expect(eventType).toBe('left click');
    }));

  it('calls the storage service',
    inject([TestRegisterInputService], (service: TestRegisterInputService) => {
      const spy = spyOn(service, 'storeEntry');
      const event = {
        type: 'mousedown', which: 1, currentTarget: null
      };
      service.addEntry(event);
      service.addEntry(event);
      expect(service.storeEntry).toHaveBeenCalledTimes(2);
    }));
});
