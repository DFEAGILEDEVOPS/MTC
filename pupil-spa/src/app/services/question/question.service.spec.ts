import { TestBed, inject } from '@angular/core/testing'

import { QuestionService } from './question.service'
import { StorageService } from '../storage/storage.service'
import { SpeechService } from '../speech/speech.service'
import { SpeechServiceMock } from '../speech/speech.service.mock'
import responseMock from '../../login.response.mock.json'

describe('QuestionService', () => {

  let storageService

  beforeEach(() => {
    const questions = responseMock['questions']
    const config = responseMock['config']
    const injector = TestBed.configureTestingModule({
      imports: [],
      providers: [
        QuestionService,
        StorageService,
        { provide: SpeechService, useClass: SpeechServiceMock }
      ]
    })
    storageService = injector.inject(StorageService)
    spyOn(storageService, 'getQuestions').and.callFake(() => questions)
    spyOn(storageService, 'getConfig').and.callFake(() => config)
  })

  it('should be created', inject([QuestionService], (service: QuestionService) => {
    expect(service).toBeTruthy()
  }))

  describe('getQuestion()', () => {
    it('returns a Question', inject([QuestionService], (service: QuestionService) => {
      service.initialise()
      const q = service.getQuestion(1)

      expect(q.constructor.name).toBe('Question')
      expect(q.factor1).toBe(2)
      expect(q.factor2).toBe(5)
      expect(q.sequenceNumber).toBe(1)
    }))

    it('returns a Question', inject([QuestionService], (service: QuestionService) => {
      service.initialise()
      const q = service.getQuestion(8)
      expect(q.constructor.name).toBe('Question')
      expect(q.factor1).toBe(4)
      expect(q.factor2).toBe(9)
      expect(q.sequenceNumber).toBe(8)
    }))

    it('with an out-of-range parameter throws an error', inject([QuestionService], (service: QuestionService) => {
      service.initialise()
      expect(function () {
        service.getQuestion(100)
      }).toThrow(new Error('Out of range: question 100 does not exist'))
    }))

    it('with an out-of-range parameter throws an error', inject([QuestionService], (service: QuestionService) => {
      service.initialise()
      expect(function () {
        service.getQuestion(-1)
      }).toThrow(new Error('Out of range: question -1 does not exist'))
    }))

    it('with a non-integer throws an error', inject([QuestionService], (service: QuestionService) => {
      service.initialise()
      expect(function () {
        service.getQuestion(5.5)
      }).toThrow(new Error('sequenceNumber is not an integer'))
    }))
  })

  describe('getNumberOfQuestions()', () => {
    it('returns the correct number of questions', inject([QuestionService], (service: QuestionService) => {
      service.initialise()
      expect(service.getNumberOfQuestions()).toBe(10)
    }))

    it('returns 0 if questions is undefined', inject([QuestionService], (service: QuestionService) => {
      service.initialise()
      service['questions'] = undefined
      expect(service.getNumberOfQuestions()).toBe(0)
    }))
  })

  it('reset() clears the questions and config', inject([QuestionService], (service: QuestionService) => {
    service.initialise()
    expect(service['questions']).toBeDefined()
    expect(service.getConfig()).toBeDefined()
    service.reset()
    expect(service['questions']).toBeNull()
    expect(service.getConfig()).toBeNull()
  }))

  it('getCurrentQuestionNumber() returns the current question number', inject([QuestionService], (service: QuestionService) => {
    expect(service.getCurrentQuestionNumber()).toBe(0)
  }))
})
