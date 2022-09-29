import { AuditEntryFactory, WarmupIntroRendered } from './auditEntry'
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
})
