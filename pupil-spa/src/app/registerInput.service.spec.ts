import { Injectable } from '@angular/core';
import { TestBed, inject } from '@angular/core/testing';

import { StorageServiceMock } from './storage.service.mock';
import { RegisterInputService } from './registerInput.service';
import { StorageService } from './storage.service';
import { QuestionService } from './question.service';

let mockStorageService: StorageServiceMock;

@Injectable()
export class testRegisterInputService extends RegisterInputService {
  public questionInputs;
  public currentQuestion;
  constructor(protected storageService: StorageService, protected questionService: QuestionService){
    super(storageService, questionService);
    this.questionInputs = [];
    this.currentQuestion = 1;
    this.questionInputs[this.currentQuestion] = [];
  }
}

describe('RegisterInputService', () => {

  beforeEach(() => {
    mockStorageService = new StorageServiceMock();
    TestBed.configureTestingModule({
      providers: [
        testRegisterInputService,
        QuestionService,
        {provide: StorageService, useValue: mockStorageService}
      ]
    });
  });

  it('should be created', inject([testRegisterInputService], (service: testRegisterInputService) => {
    expect(service).toBeTruthy();
  }));

  it('StoreEntry with populate the questionInputs array', inject([testRegisterInputService], (service: testRegisterInputService) => {
    const eventValue = '0';
    const eventType = 'keydown';
    service.storeEntry(eventValue, eventType);
    const record = service.questionInputs[service.currentQuestion][0];
    expect(record.input).toBe('0');
    expect(record.eventType).toBe('keydown');
    expect(record.clientInputDate instanceof Date).toBeTruthy();
  }));

  it('AddEntry to call StoreEntry', inject([testRegisterInputService], (service: testRegisterInputService) => {
    spyOn(service, 'storeEntry');
    const event = {type: 'keydown', key: 'f'};
    service.addEntry(event);
    expect(service.storeEntry).toHaveBeenCalledTimes(1);
  }));

  it('expects a left click event to be registered', inject([testRegisterInputService], (service: testRegisterInputService) => {
    const event = { type: 'mousedown', which: 1 };
    service.addEntry(event);
    const record = service.questionInputs[service.currentQuestion][0];
    expect(record.input).toBe('left click');
  }));

  it('inputs will have to be registered to storage service on component destroy', inject([testRegisterInputService], (registerService: testRegisterInputService) => {
    const event = { type: 'mousedown', which: 1 };
    spyOn(mockStorageService, 'setItem');
    registerService.addEntry(event);
    registerService.addEntry(event);
    registerService.ngOnDestroy();
    const records = registerService.questionInputs[registerService.currentQuestion];
    expect(records.length).toBe(2);
    // the first item of the array will be undefined since the questions are not 0-indexed
    expect(mockStorageService.setItem).toHaveBeenCalledWith('inputs', [undefined, records]);
  }));
});
