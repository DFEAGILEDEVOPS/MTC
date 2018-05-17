import { TestBed } from '@angular/core/testing';

import { Answer } from './answer.model';
import { AnswerService } from './answer.service';
import { StorageService } from '../storage/storage.service';

let service: AnswerService;
let storageService: StorageService;

describe('AnswerService', () => {

  const toPoJo = (answer) => JSON.parse(JSON.stringify(answer));

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [AnswerService, StorageService]
    });
    localStorage.clear();
    storageService = injector.get(StorageService);
    service = new AnswerService(storageService);
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
    service.setAnswer(answer3);
    answer3.question = '3x3';
    answer3.clientTimestamp = new Date('1970-01-01');
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
});
