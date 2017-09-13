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
  public questionInputs;
  public currentQuestion;

  constructor(protected storageService: StorageService, protected questionService: QuestionService) {
    super(storageService, questionService);
  }
}

describe('RegisterInputService', () => {

  beforeEach(() => {
    mockStorageService = new StorageServiceMock();
    mockQuestionService = new QuestionServiceMock();
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

  it('StoreEntry with populate the questionInputs array',
    inject([TestRegisterInputService], (service: TestRegisterInputService) => {
      service.initialise();
      const eventValue = '0';
      const eventType = 'keydown';
      service.storeEntry(eventValue, eventType);
      const record = service.questionInputs[service.currentQuestion][0];
      expect(record.input).toBe('0');
      expect(record.eventType).toBe('keydown');
      expect(record.clientInputDate instanceof Date).toBeTruthy();
    }));

  it('AddEntry to call StoreEntry', inject([TestRegisterInputService], (service: TestRegisterInputService) => {
    spyOn(service, 'storeEntry');
    service.initialise();
    const event = {type: 'keydown', key: 'f'};
    service.addEntry(event);
    expect(service.storeEntry).toHaveBeenCalledTimes(1);
  }));

  it('expects a left click event to be registered',
    inject([TestRegisterInputService], (service: TestRegisterInputService) => {
      service.initialise();
      const event = {type: 'mousedown', which: 1};
      service.addEntry(event);
      const record = service.questionInputs[service.currentQuestion][0];
      expect(record.input).toBe('left click');
    }));

  it('inputs will have to be registered to storage service on component flush', inject([TestRegisterInputService],
    (registerInputService: TestRegisterInputService) => {
      registerInputService.initialise();
      const event = {type: 'mousedown', which: 1};
      spyOn(mockStorageService, 'setItem');
      registerInputService.addEntry(event);
      registerInputService.addEntry(event);
      registerInputService.flush();
      const records = registerInputService.questionInputs[registerInputService.currentQuestion];
      expect(records.length).toBe(2);
      expect(mockStorageService.setItem).toHaveBeenCalledWith('inputs', [undefined, records]);
    }));
});
