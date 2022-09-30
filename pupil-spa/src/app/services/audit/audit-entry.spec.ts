import {
  AuditEntryFactory,
  CheckStarted,
  CheckStartedAPICallSucceeded, CheckSubmissionPending, PauseRendered,
  QuestionAnswered,
  WarmupCompleteRendered,
  WarmupIntroRendered
} from './auditEntry'
import { TestBed } from '@angular/core/testing'
import { MonotonicTimeService } from '../monotonic-time/monotonic-time.service'

describe('auditEntryFactory', () => {
  let factory: AuditEntryFactory

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [
        MonotonicTimeService,
      ]
    })
    factory = injector.inject(AuditEntryFactory)
  })

  describe('#createPupilPrefsAPICalled', () => {
    it('factory method creates createPupilPrefsAPICalled obj', () => {
      const c = factory.createPupilPrefsAPICalled()
      expect(c.constructor.name).toBe('PupilPrefsAPICalled')
    })
  })

  describe('#createpupilPrefsAPICallSucceeded', () => {
    it('factory method creates PupilPrefsAPICallSucceeded obj', () => {
      const c = factory.createPupilPrefsAPICallSucceeded()
      expect(c.constructor.name).toBe('PupilPrefsAPICallSucceeded')
    })
  })

  describe('#createPupilPrefsAPICallFailed', () => {
    it('factory method creates PupilPrefsAPICallFailed obj', () => {
      const c = factory.createPupilPrefsAPICallFailed()
      expect(c.constructor.name).toBe('PupilPrefsAPICallFailed')
    })
  })

  describe('#createWarmupIntroRendered', () => {
    it('factory method creates WarmupIntroRendered obj', () => {
      const c = factory.createWarmupIntroRendered()
      expect(c.constructor.name).toBe('WarmupIntroRendered')
    })
  })

  describe('#createWarmupCompleteRendered', () => {
    it('factory method creates WarmupCompleteRendered obj', () => {
      const c = factory.createWarmupCompleteRendered()
      expect(c.constructor.name).toBe('WarmupCompleteRendered')
    })
  })

  describe('#createQuestionIntroRendered', () => {
    it('factory method creates QuestionIntroRendered obj', () => {
      const c = factory.createQuestionIntroRendered()
      expect(c.constructor.name).toBe('QuestionIntroRendered')
    })
  })

  describe('#createWarmupCompleteRendered', () => {
    it('factory method creates WarmupCompleteRendered obj', () => {
      const c = factory.createWarmupCompleteRendered()
      expect(c.constructor.name).toBe('WarmupCompleteRendered')
    })
  })

  describe('#createCheckStartedApiCalled', () => {
    it('factory method creates CheckStartedApiCalled obj', () => {
      const c = factory.createCheckStartedApiCalled()
      expect(c.constructor.name).toBe('CheckStartedApiCalled')
    })
  })

  describe('#createCheckStartedAPICallSucceeded', () => {
    it('factory method creates CheckStartedAPICallSucceeded obj', () => {
      const c = factory.createCheckStartedAPICallSucceeded()
      expect(c.constructor.name).toBe('CheckStartedAPICallSucceeded')
    })
  })

  describe('#createCheckStartedAPICallFailed', () => {
    it('factory method creates CheckStartedAPICallFailed obj', () => {
      const c = factory.createCheckStartedAPICallFailed()
      expect(c.constructor.name).toBe('CheckStartedAPICallFailed')
    })
  })

  describe('#createCheckStarted', () => {
    it('factory method creates CheckStarted obj', () => {
      const c = factory.createCheckStarted()
      expect(c.constructor.name).toBe('CheckStarted')
    })
  })

  describe('#createQuestionAnswered', () => {
    it('factory method creates QuestionAnswered obj', () => {
      const c = factory.createQuestionAnswered()
      expect(c.constructor.name).toBe('QuestionAnswered')
    })
  })

  describe('#createPauseRendered', () => {
    it('factory method creates PauseRendered obj', () => {
      const c = factory.createPauseRendered()
      expect(c.constructor.name).toBe('PauseRendered')
    })
  })

  describe('#createCheckSubmissionPending', () => {
    it('factory method creates CheckSubmissionPending obj', () => {
      const c = factory.createCheckSubmissionPending()
      expect(c.constructor.name).toBe('CheckSubmissionPending')
    })
  })
})
