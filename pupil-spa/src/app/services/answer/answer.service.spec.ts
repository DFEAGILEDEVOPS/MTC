import { TestBed } from '@angular/core/testing';

import { Answer } from './answer.model';
import { AnswerService } from './answer.service';
import { StorageService } from '../storage/storage.service';
import { AuditServiceMock } from '../audit/audit.service.mock';
import { AuditService } from '../audit/audit.service';

let service: AnswerService;
let storageService: StorageService;

describe('AnswerService', () => {

  const toPoJo = (answer) => JSON.parse(JSON.stringify(answer));

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [
        AnswerService,
        StorageService,
        {provide: AuditService, useClass: AuditServiceMock }
      ]
    });
    localStorage.clear();
    storageService = injector.get(StorageService);
    service = new AnswerService(storageService);
    jasmine.clock().mockDate(new Date('1970-01-01'));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store answer under unique key', () => {
    const setAnswerSpy = spyOn(storageService, 'setAnswer');
    const answer1 = new Answer(3, 3, '3', 3);
    answer1.question = '3x3';
    answer1.clientTimestamp = new Date('1970-01-01');
    service.setAnswer(answer1);
    expect(setAnswerSpy.calls.allArgs()[0][0]).toEqual(answer1);
  });

  it('should create answers object if it does not already exist', () => {
    const answer1 = new Answer(1, 1, '1', 1);
    service.setAnswer(answer1);
    answer1.question = '1x1';
    answer1.clientTimestamp = new Date('1970-01-01');
    const expected = toPoJo(answer1);
    const items = storageService.getAllItems();
    expect(items[Object.keys(items)[0]]).toEqual(expected);
  });
});
