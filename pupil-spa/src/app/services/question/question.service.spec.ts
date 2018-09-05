import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { QuestionService } from './question.service';
import { StorageService } from '../storage/storage.service';
import { SpeechService } from '../speech/speech.service';
import { SpeechServiceMock } from '../speech/speech.service.mock';
import * as responseMock from '../../login.response.mock.json';

describe('QuestionService', () => {

  let mockStorageService;

  beforeEach(() => {
    mockStorageService = {
      getItem() {
      }
    };
    const questions = responseMock['questions'];
    const config = responseMock['config'];
    spyOn(mockStorageService, 'getItem').and.callFake((arg) => {
      switch (arg) {
        case 'config':
          return config;
        case 'questions':
          return questions;
      }
    });
    TestBed.configureTestingModule({
      imports: [ HttpModule ],
      providers: [
        QuestionService,
        { provide: StorageService, useValue: mockStorageService },
        { provide: SpeechService, useClass: SpeechServiceMock }
      ]
    });
  });

  it('should be created', inject([QuestionService], (service: QuestionService) => {
    expect(service).toBeTruthy();
  }));

  it('getQuestion() returns a Question', inject([QuestionService], (service: QuestionService) => {
    const q = service.getQuestion(1);

    expect(q.constructor.name).toBe('Question');
    expect(q.factor1).toBe(2);
    expect(q.factor2).toBe(5);
    expect(q.sequenceNumber).toBe(1);
  }));

  it('getQuestion() returns a Question', inject([QuestionService], (service: QuestionService) => {
    const q = service.getQuestion(3);
    expect(q.constructor.name).toBe('Question');
    expect(q.factor1).toBe(5);
    expect(q.factor2).toBe(10);
    expect(q.sequenceNumber).toBe(3);
  }));

  it('getQuestion() with an out-of-range parameter throws an error', inject([QuestionService], (service: QuestionService) => {
    expect(function () {
      service.getQuestion(100);
    }).toThrow(new Error('Out of range: question 100 does not exist'));
  }));

  it('getQuestion() with an out-of-range parameter throws an error', inject([QuestionService], (service: QuestionService) => {
    expect(function () {
      service.getQuestion(-1);
    }).toThrow(new Error('Out of range: question -1 does not exist'));
  }));

  it('getQuestion() with a non-integer throws an error', inject([QuestionService], (service: QuestionService) => {
    expect(function () {
      service.getQuestion(5.5);
    }).toThrow(new Error('sequenceNumber is not an integer'));
  }));

  it('getNumberOfQuestions() returns the correct number of questions', inject([QuestionService], (service: QuestionService) => {
    expect(service.getNumberOfQuestions()).toBe(5);
  }));

  it('reset() clears the questions and config',  inject([QuestionService], (service: QuestionService) => {
    expect(service['questions']).toBeDefined();
    expect(service.getConfig()).toBeDefined();
    service.reset();
    expect(service['questions']).toBeNull();
    expect(service.getConfig()).toBeNull();
  }));

  it('getCurrentQuestionNumber() returns the current question number',  inject([QuestionService], (service: QuestionService) => {
    expect(service.getCurrentQuestionNumber()).toBe(0);
  }));
});
