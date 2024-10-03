import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { AnswerService } from '../services/answer/answer.service'
import { AuditService } from '../services/audit/audit.service'
import { AuditServiceMock } from '../services/audit/audit.service.mock'
import { QuestionService } from '../services/question/question.service'
import { QuestionServiceMock } from '../services/question/question.service.mock'
import { RegisterInputService } from '../services/register-input/registerInput.service'
import { RegisterInputServiceMock } from '../services/register-input/register-input-service.mock'
import { SoundComponentMock } from '../sound/sound-component-mock'
import { SpeechService } from '../services/speech/speech.service'
import { SpeechServiceMock } from '../services/speech/speech.service.mock'
import { SpokenQuestionComponent } from './spoken-question.component'
import { IStorageService, StorageService } from '../services/storage/storage.service'
import { StorageServiceMock } from '../services/storage/mock-storage.service'
import { WindowRefService } from '../services/window-ref/window-ref.service'
import { MonotonicTimeService } from '../services/monotonic-time/monotonic-time.service'
import { AuditEntryFactory } from '../services/audit/auditEntry'

function dispatchKeyEvent (keyboardDict) {
  const event = new KeyboardEvent('keyup', keyboardDict)
  event.initEvent('keyup', true, true)
  document.dispatchEvent(event)
  return event
}

describe('SpokenQuestionComponent', () => {
  let component: SpokenQuestionComponent
  let fixture: ComponentFixture<SpokenQuestionComponent>
  let speechService, storageService: IStorageService, answerService: AnswerService
  let answerServiceSpy: any
  let registerInputService: RegisterInputService
  let registerInputServiceSpy: any
  let auditService: AuditService
  let auditServiceSpy: any
  let storageServiceSetAnswerSpy: jasmine.Spy

  beforeEach(waitForAsync(() => {
    storageService = new StorageServiceMock()
    answerService = new AnswerService(storageService as StorageService, new MonotonicTimeService(new WindowRefService()))
    TestBed.configureTestingModule({
      declarations: [SpokenQuestionComponent],
      providers: [
        { provide: AuditService, useClass: AuditServiceMock },
        WindowRefService,
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: StorageService, useValue: storageService },
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: AnswerService, useValue: answerService },
        { provide: RegisterInputService, useClass: RegisterInputServiceMock },
        AuditEntryFactory
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SpokenQuestionComponent)
    component = fixture.componentInstance
    component.config.questionReader = true
    component.soundComponent = new SoundComponentMock()
    // Get a ref to services for easy spying
    speechService = fixture.debugElement.injector.get(SpeechService)

    // prevent SpeechServiceMock from calling 'end' by default
    spyOn(speechService, 'speakQuestion')
    answerServiceSpy = spyOn(answerService, 'setAnswer').and.callThrough()

    registerInputService = fixture.debugElement.injector.get(RegisterInputService)
    registerInputServiceSpy = spyOn(registerInputService, 'storeEntry')

    auditService = fixture.debugElement.injector.get(AuditService)
    auditServiceSpy = spyOn(auditService, 'addEntry')

    storageServiceSetAnswerSpy = spyOn(storageService, 'setAnswer')
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('starts speaking the question straight away', () => {
    expect(speechService.speakQuestion).toHaveBeenCalledTimes(1)
  })

  describe('the timer', () => {
    it('does not start straight away', () => {
      expect(component['timeout']).toBeUndefined()
      expect(component['countdownTimer']).toBeUndefined()
    })

    it('starts after the speech has ended', () => {
      speechService.speechStatusSource.next(SpeechServiceMock.questionSpeechEnded)
      expect(component['timeout']).toBeDefined()
      expect(component['countdownInterval']).toBeTruthy()
    })
  })

  describe('#preSendTimeoutEvent', () => {
    it('stores the answer', () => {
      component.answer = '6'
      component.preSendTimeoutEvent()
      expect(answerServiceSpy).toHaveBeenCalled()
    })
  })

  describe('handleKeyboardEvent', () => {

    it('does not register key strokes after submission', () => {
      component.startTimer()
      dispatchKeyEvent({ key: '1' })
      dispatchKeyEvent({ key: '2' })
      dispatchKeyEvent({ key: '3' })
      expect(component.answer).toBe('123')
      component.onSubmit() // press enter
      dispatchKeyEvent({ key: '4' })
      expect(registerInputServiceSpy.calls.count()).toBe(3) // 4th one is ignored after enter is pressed
      // That last key press should not be registered in the answer either
      expect(component.answer).toBe('123')
    })
  })

  describe('onSubmit', () => {
    it('waits for the end of speech before moving to the pause screen', () => {
      spyOn(speechService, 'waitForEndOfSpeech').and.callThrough()
      component.config.questionReader = true
      component.factor1 = 1
      component.factor2 = 2
      component.sequenceNumber = 3
      component.answer = ''
      // Add some input to cause the speech reader to do some work
      component.startTimer()
      dispatchKeyEvent({ key: '2' })
      dispatchKeyEvent({ key: '2' })
      dispatchKeyEvent({ key: '2' })

      // Simulate pressing or clicking enter
      component.onSubmit()

      // Test that the component called the expected function
      expect(speechService.waitForEndOfSpeech).toHaveBeenCalled()
    })

    it('stores the answer when submit is pressed', () => {
      answerServiceSpy.calls.reset()
      component.factor1 = 1
      component.factor2 = 2
      component.sequenceNumber = 3
      component.answer = ''
      component.startTimer()
      dispatchKeyEvent({ key: '2' })
      component.onSubmit()
      expect(answerServiceSpy).toHaveBeenCalled()
    })

    it('stores the answer before it stores the QuestionAnswered Audit', () => {
      auditServiceSpy.calls.reset()
      component.startTimer()
      dispatchKeyEvent({ key: '8' })
      component.onSubmit()
      const answerArgs = storageServiceSetAnswerSpy.calls.mostRecent().args[0]
      const answerTimestamp = answerArgs.monotonicTime.legacyDate
      const auditArgs = auditServiceSpy.calls.allArgs()
      console.log('auditArgs', auditArgs)
      const questionAnsweredArg = auditArgs.find(o => o[0].type === 'QuestionAnswered')
      const questionAnsweredTimestamp = questionAnsweredArg[0].data.monotonicTime.legacyDate
      if (!questionAnsweredTimestamp || !answerTimestamp) {
        fail('Missing timestamp')
      }
      expect(answerTimestamp.getTime()).toBeLessThanOrEqual(questionAnsweredTimestamp.getTime())
    })
  })
})
