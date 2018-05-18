import { TestBed } from '@angular/core/testing';

import { Answer } from './answer.model';
import { AnswerService } from './answer.service';
import { StorageService } from '../storage/storage.service';
import { AuditServiceMock } from '../audit/audit.service.mock';
import { AuditService } from '../audit/audit.service';

let service: AnswerService;
let storageService: StorageService;
let auditService: AuditService;

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
    auditService = injector.get(AuditService);
    service = new AnswerService(storageService, auditService);
    jasmine.clock().mockDate(new Date('1970-01-01'));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should append answer to answers object in storage service', () => {
    const answer1 = new Answer(1, 1, '1', 1, '1x1', new Date('1970-01-01'));
    const answer2 = new Answer(2, 2, '2', 2, '2x2', new Date('1970-01-01'));
    const existingAnswers = [answer1, answer2];
    storageService.setItem('answers', existingAnswers);
    const answer3 = new Answer(3, 3, '3', 3);
    answer3.question = '3x3';
    answer3.clientTimestamp = new Date('1970-01-01');
    service.setAnswer(answer3);
    const expected = [toPoJo(answer1), toPoJo(answer2), toPoJo(answer3)];
    const actual = storageService.getItem('answers');
    expect(actual).toEqual(expected);
  });

  it('should create answers object if it does not already exist', () => {
    const answer1 = new Answer(1, 1, '1', 1);
    service.setAnswer(answer1);
    answer1.question = '1x1';
    answer1.clientTimestamp = new Date('1970-01-01');
    const expected = [toPoJo(answer1)];
    const actual = storageService.getItem('answers');
    expect(actual).toEqual(expected);
  });

  it('should not add duplicate answers', () => {
    const answer = new Answer(1, 1, '1', 1);
    spyOn(storageService, 'setItem');
    spyOn(storageService, 'getItem').and.returnValues(
      [], // 1st call
      [ answer ] // 2nd call
    );
    service.setAnswer(answer);
    service.setAnswer(answer);
    expect(storageService.setItem).toHaveBeenCalledTimes(1);
  });

  it('logs the attempted duplication to the audit log', () => {
    const answer = new Answer(9, 8, '1', 20);
    spyOn(storageService, 'setItem');
    const auditServiceAddEntrySpy = spyOn(auditService, 'addEntry');
    spyOn(storageService, 'getItem').and.returnValues(
      [], // 1st call
      [ answer ] // 2nd call
    );
    service.setAnswer(answer);
    service.setAnswer(answer);
    expect(auditServiceAddEntrySpy).toHaveBeenCalled();
    const auditArg = auditServiceAddEntrySpy.calls.mostRecent().args[0];
    expect(auditArg.type).toBe('DuplicateAnswerError');
    expect(auditArg.data.factor1).toBe(9);
    expect(auditArg.data.factor2).toBe(8);
    expect(auditArg.data.sequenceNumber).toBe(20);
  });
});
