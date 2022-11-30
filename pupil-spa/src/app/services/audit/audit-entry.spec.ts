import { AuditEntryFactory } from './auditEntry'
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
      expect(c.type).toBe('PupilPrefsAPICalled')
    })
  })

  describe('#createpupilPrefsAPICallSucceeded', () => {
    it('factory method creates PupilPrefsAPICallSucceeded obj', () => {
      const c = factory.createPupilPrefsAPICallSucceeded()
      expect(c.type).toBe('PupilPrefsAPICallSucceeded')
    })
  })

  describe('#createPupilPrefsAPICallFailed', () => {
    it('factory method creates PupilPrefsAPICallFailed obj', () => {
      const c = factory.createPupilPrefsAPICallFailed()
      expect(c.type).toBe('PupilPrefsAPICallFailed')
    })
  })

  describe('#createWarmupStarted', () => {
    it('factory method creates cWarmupStarted obj', () => {
      const c = factory.createWarmupStarted()
      expect(c.type).toBe('WarmupStarted')
    })
  })

  describe('#createWarmupIntroRendered', () => {
    it('factory method creates WarmupIntroRendered obj', () => {
      const c = factory.createWarmupIntroRendered()
      expect(c.type).toBe('WarmupIntroRendered')
    })
  })

  describe('#createQuestionIntroRendered', () => {
    it('factory method creates QuestionIntroRendered obj', () => {
      const c = factory.createQuestionIntroRendered()
      expect(c.type).toBe('QuestionIntroRendered')
    })
  })

  describe('#createWarmupCompleteRendered', () => {
    it('factory method creates WarmupCompleteRendered obj', () => {
      const c = factory.createWarmupCompleteRendered()
      expect(c.type).toBe('WarmupCompleteRendered')
    })
  })

  describe('#createWarmupCompleteRendered', () => {
    it('factory method creates WarmupCompleteRendered obj', () => {
      const c = factory.createWarmupCompleteRendered()
      expect(c.type).toBe('WarmupCompleteRendered')
    })
  })

  describe('#createCheckStartedApiCalled', () => {
    it('factory method creates CheckStartedApiCalled obj', () => {
      const c = factory.createCheckStartedApiCalled()
      expect(c.type).toBe('CheckStartedApiCalled')
    })
  })

  describe('#createCheckStartedAPICallSucceeded', () => {
    it('factory method creates CheckStartedAPICallSucceeded obj', () => {
      const c = factory.createCheckStartedAPICallSucceeded()
      expect(c.type).toBe('CheckStartedAPICallSucceeded')
    })
  })

  describe('#createCheckStartedAPICallFailed', () => {
    it('factory method creates CheckStartedAPICallFailed obj', () => {
      const c = factory.createCheckStartedAPICallFailed()
      expect(c.type).toBe('CheckStartedAPICallFailed')
    })
  })

  describe('#createQuestionRendered', () => {
    it('factory method creates QuestionRendered obj', () => {
      const c = factory.createQuestionRendered()
      expect(c.type).toBe('QuestionRendered')
    })
  })

  describe('#createCheckStarted', () => {
    it('factory method creates CheckStarted obj', () => {
      const c = factory.createCheckStarted()
      expect(c.type).toBe('CheckStarted')
    })
  })

  describe('#createQuestionAnswered', () => {
    it('factory method creates QuestionAnswered obj', () => {
      const c = factory.createQuestionAnswered()
      expect(c.type).toBe('QuestionAnswered')
    })
  })

  describe('#createPauseRendered', () => {
    it('factory method creates PauseRendered obj', () => {
      const c = factory.createPauseRendered()
      expect(c.type).toBe('PauseRendered')
    })
  })

  describe('#createCheckSubmissionPending', () => {
    it('factory method creates CheckSubmissionPending obj', () => {
      const c = factory.createCheckSubmissionPending()
      expect(c.type).toBe('CheckSubmissionPending')
    })
  })

  describe('#createCheckSubmissionApiCalled', () => {
    it('factory method creates CheckSubmissionApiCalled obj', () => {
      const c = factory.createCheckSubmissionApiCalled()
      expect(c.type).toBe('CheckSubmissionApiCalled')
    })
  })

  describe('#createCheckSubmissionAPICallSucceeded', () => {
    it('factory method creates CheckSubmissionAPICallSucceeded obj', () => {
      const c = factory.createCheckSubmissionAPICallSucceeded()
      expect(c.type).toBe('CheckSubmissionAPICallSucceeded')
    })
  })

  describe('#createCheckSubmissionAPIFailed', () => {
    it('factory method creates CheckSubmissionAPIFailed obj', () => {
      const c = factory.createCheckSubmissionAPIFailed()
      expect(c.type).toBe('CheckSubmissionAPIFailed')
    })
  })

  describe('#createCheckSubmissionFailed', () => {
    it('factory method creates CheckSubmissionFailed obj', () => {
      const c = factory.createCheckSubmissionFailed()
      expect(c.type).toBe('CheckSubmissionFailed')
    })
  })

  describe('#createSessionExpired', () => {
    it('factory method creates SessionExpired obj', () => {
      const c = factory.createSessionExpired()
      expect(c.type).toBe('SessionExpired')
    })
  })

  describe('#createRefreshDetected', () => {
    it('factory method creates RefreshDetected obj', () => {
      const c = factory.createRefreshDetected()
      expect(c.type).toBe('RefreshDetected')
    })
  })

  describe('#createUtteranceStarted', () => {
    it('factory method creates UtteranceStarted obj', () => {
      const c = factory.createUtteranceStarted()
      expect(c.type).toBe('UtteranceStarted')
    })
  })

  describe('#createUtteranceEnded', () => {
    it('factory method creates UtteranceEnded obj', () => {
      const c = factory.createUtteranceEnded()
      expect(c.type).toBe('UtteranceEnded')
    })
  })

  describe('#createQuestionReadingStarted', () => {
    it('factory method creates QuestionReadingStarted obj', () => {
      const c = factory.createQuestionReadingStarted()
      expect(c.type).toBe('QuestionReadingStarted')
    })
  })

  describe('#createQuestionReadingEnded', () => {
    it('factory method creates QuestionReadingEnded obj', () => {
      const c = factory.createQuestionReadingEnded()
      expect(c.type).toBe('QuestionReadingEnded')
    })
  })

  describe('#createQuestionTimerStarted', () => {
    it('factory method creates QuestionTimerStarted obj', () => {
      const c = factory.createQuestionTimerStarted()
      expect(c.type).toBe('QuestionTimerStarted')
    })
  })

  describe('#createQuestionTimerEnded', () => {
    it('factory method creates QuestionTimerEnded obj', () => {
      const c = factory.createQuestionTimerEnded()
      expect(c.type).toBe('QuestionTimerEnded')
    })
  })

  describe('#createQuestionTimerCancelled', () => {
    it('factory method creates QuestionTimerCancelled obj', () => {
      const c = factory.createQuestionTimerCancelled()
      expect(c.type).toBe('QuestionTimerCancelled')
    })
  })

  describe('#createAppError', () => {
    it('factory method creates AppError obj', () => {
      const c = factory.createAppError()
      expect(c.type).toBe('AppError')
    })
  })

  describe('#createAppVisible', () => {
    it('factory method creates AppVisible obj', () => {
      const c = factory.createAppVisible()
      expect(c.type).toBe('AppVisible')
    })
  })

  describe('#createAppHidden', () => {
    it('factory method creates AppHidden obj', () => {
      const c = factory.createAppHidden()
      expect(c.type).toBe('AppHidden')
    })
  })

  describe('#createRefreshOrTabCloseDetected', () => {
    it('factory method creates RefreshOrTabCloseDetected obj', () => {
      const c = factory.createRefreshOrTabCloseDetected()
      expect(c.type).toBe('RefreshOrTabCloseDetected')
    })
  })
})
