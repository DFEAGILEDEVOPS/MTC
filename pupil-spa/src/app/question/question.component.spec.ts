import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { AnswerService } from '../services/answer/answer.service'
import { AuditService } from '../services/audit/audit.service'
import { AuditServiceMock } from '../services/audit/audit.service.mock'
import { QuestionComponent } from './question.component'
import { AuditEntryFactory, QuestionAnswered, QuestionTimerCancelled } from '../services/audit/auditEntry'
import { QuestionService } from '../services/question/question.service'
import { QuestionServiceMock } from '../services/question/question.service.mock'
import { RegisterInputService } from '../services/register-input/registerInput.service'
import { RegisterInputServiceMock } from '../services/register-input/register-input-service.mock'
import { SoundComponentMock } from '../sound/sound-component-mock'
import { SpeechService } from '../services/speech/speech.service'
import { SpeechServiceMock } from '../services/speech/speech.service.mock'
import { IStorageService, StorageService } from '../services/storage/storage.service'
import { WindowRefService } from '../services/window-ref/window-ref.service'
import { Renderer2 } from '@angular/core'
import { MonotonicTimeService } from '../services/monotonic-time/monotonic-time.service'
import { StorageServiceMock } from '../services/storage/mock-storage.service'

describe('QuestionComponent', () => {
  let component: QuestionComponent
  let fixture: ComponentFixture<QuestionComponent>
  const auditServiceMock = new AuditServiceMock()
  let registerInputService: RegisterInputService
  let registerInputServiceSpy: any
  let answerService: AnswerService
  let answerServiceSpy: any
  let auditService: AuditService
  let auditServiceSpy
  let storageService: StorageService
  let storageServiceSetAnswerSpy: jasmine.Spy

  beforeEach(waitForAsync(() => {
    storageService = new StorageServiceMock() as unknown as StorageService
    answerService = new AnswerService(storageService, new MonotonicTimeService(new WindowRefService()))
    TestBed.configureTestingModule({
      imports: [],
      declarations: [QuestionComponent],
      providers: [
        { provide: AuditService, useValue: auditServiceMock },
        WindowRefService,
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: StorageService, useValue: storageService},
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: AnswerService, useValue: answerService },
        { provide: RegisterInputService, useClass: RegisterInputServiceMock },
        Renderer2,
        AuditEntryFactory
      ]
    }).compileComponents().catch(error => {
      console.error(error)
    })
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionComponent)
    component = fixture.componentInstance
    component.soundComponent = new SoundComponentMock()

    // This is the best way to get the injected service, the way that _always_ _works_
    // https://angular.io/guide/testing#get-injected-services
    registerInputService = fixture.debugElement.injector.get(RegisterInputService)
    registerInputServiceSpy = spyOn(registerInputService, 'storeEntry')

    answerServiceSpy = spyOn(answerService, 'setAnswer').and.callThrough()

    auditService = fixture.debugElement.injector.get(AuditService)
    auditServiceSpy = spyOn(auditService, 'addEntry')

    // storageService = fixture.debugElement.injector.get(StorageService)
    storageServiceSetAnswerSpy = spyOn(storageService, 'setAnswer')
    // Place this last so the spies above are registered.
    fixture.detectChanges()
  })

  it('should be created', () => {
    expect(component).toBeTruthy()
  })

  describe('an audit entry', () => {
    it('is added on question rendered', () => {
      component.sequenceNumber = 1
      component.factor1 = 2
      component.factor2 = 3
      auditServiceSpy.calls.reset()
      component.ngAfterViewInit()
      expect(auditServiceSpy).toHaveBeenCalledTimes(2) // two times, timer event + render event
      const auditEntryArgs = auditServiceSpy.calls.allArgs()
      const questionRendered = auditEntryArgs.find(o => o[0].type === 'QuestionRendered')
      expect((<any>questionRendered[0].data).sequenceNumber).toBe(1)
      expect((<any>questionRendered[0].data).question).toBe('2x3')
    })

    it('is added on answer submitted', () => {
      component.sequenceNumber = 1
      component.factor1 = 2
      component.factor2 = 3
      component.answer = '42'
      auditServiceSpy.calls.reset()
      component.onSubmit()
      expect(auditServiceSpy).toHaveBeenCalledTimes(2) // two times, timer event + answer event
      const auditEntryArgs = auditServiceSpy.calls.allArgs()
      const auditEntryArg = auditEntryArgs.find(o => o[0].type === 'QuestionAnswered')
      const auditEntryInserted = auditEntryArg && auditEntryArg[0]
      expect(auditEntryInserted instanceof QuestionAnswered
        || auditEntryInserted instanceof QuestionTimerCancelled).toBeTruthy()
      expect((<any>auditEntryInserted.data).sequenceNumber).toBe(1)
      expect((<any>auditEntryInserted.data).question).toBe('2x3')
    })
  })

  describe('#onClickBackspace', () => {
    it('calls registerInputService', () => {
      component.sequenceNumber = 1
      component.factor1 = 1
      component.factor2 = 2
      const event = { timeStamp: 1519211809934 }
      //@ts-ignore need to mock timestamp
      component.onClickBackspace(event)
      expect(registerInputServiceSpy).toHaveBeenCalledTimes(1)
      expect(registerInputServiceSpy).toHaveBeenCalledWith('Backspace', 'mouse', 1, '1x2', 1519211809934)
    })

    it('deletes a char from the answer', () => {
      component['answer'] = '1444'
      const event = new Event('event')
      component.onClickBackspace(event)
      expect(component['answer']).toBe('144')
    })

    it('does not delete a char from the answer once it has been submitted', () => {
      const event = new Event('event')
      component['answer'] = '1444'
      component.onClickBackspace(new Event('event'))
      expect(component['answer']).toBe('144')
      component.onClickSubmit(new Event('event'))
      component.onClickBackspace(event)
      expect(component['answer']).toBe('144')
    })

    it('does not add to the input register once it has been submitted', () => {
      // answer = ''
      const e1 = new PointerEvent('pointerup', {
        pointerId: 1,
        bubbles: true,
        cancelable: true,
        pointerType: 'mouse',
        width: 100,
        height: 100,
        isPrimary: true
      })
      component.button1.nativeElement.dispatchEvent(e1)
      component.button1.nativeElement.dispatchEvent(e1)
      component.button1.nativeElement.dispatchEvent(e1)
      // answer = '111'
      component.onClickBackspace(new Event('event'))
      component.onClickBackspace(new Event('event'))
      // answer = '1'
      expect(registerInputService.storeEntry).toHaveBeenCalledTimes(5)
      component.onClickSubmit(new Event('event')) // needs something in the answer box
      component.onClickBackspace(new Event('event'))

      // We expect the input service to have been called 1 more time for the submit event, but not for the additional click
      expect(registerInputService.storeEntry).toHaveBeenCalledTimes(6)
    })
  })

  describe('#onClickSubmit', () => {
    it('calls registerInputService', () => {
      component.sequenceNumber = 1
      component.factor1 = 1
      component.factor2 = 2
      const event = { timeStamp: 1519211809934 }
      //@ts-ignore need to mock timestamp
      component.onClickSubmit(event)
      expect(registerInputServiceSpy).toHaveBeenCalledTimes(1)
      expect(registerInputServiceSpy).toHaveBeenCalledWith('Enter', 'mouse', 1, '1x2', 1519211809934)
    })

    it('calls onSubmit()', () => {
      spyOn(component, 'onSubmit')
      const event = {}
      //@ts-ignore need to mock timestamp
      component.onClickSubmit(event)
      expect(component.onSubmit).toHaveBeenCalledTimes(1)
    })

    it('does not add to the input register once submitted', () => {
      const e1 = new PointerEvent('pointerup', {
        pointerId: 1,
        bubbles: true,
        cancelable: true,
        pointerType: 'mouse',
        width: 100,
        height: 100,
        isPrimary: true
      })
      component.button9.nativeElement.dispatchEvent(e1)
      component.button9.nativeElement.dispatchEvent(e1)
      component.onClickSubmit(new Event('event'))
      expect(registerInputServiceSpy).toHaveBeenCalledTimes(3)
      component.onClickSubmit(new Event('event'))
      // It should not call the registerInputService again not that submit has been clicked already
      expect(registerInputServiceSpy).toHaveBeenCalledTimes(3)
    })
  })

  describe('#onSubmit', () => {
    it('stores the answer when submit is pressed', () => {
      component.answer = '9'
      answerServiceSpy.calls.reset()
      component.onSubmit()
      expect(answerServiceSpy).toHaveBeenCalled()
    })

    it('stores the answer before it stores the QuestionAnswered Audit', () => {
      component.factor1 = 1
      component.factor2 = 2
      component.answer = '8'
      component.sequenceNumber = 1
      auditServiceSpy.calls.reset()
      storageServiceSetAnswerSpy.calls.reset()
      component.onSubmit()
      const answerArgs = storageServiceSetAnswerSpy.calls.mostRecent().args[0]
      const answerTimestamp: string = answerArgs.clientTimestamp
      const answerDateTime = new Date(answerTimestamp)
      const auditArgs = auditServiceSpy.calls.allArgs()
      const questionAnsweredArg = auditArgs.find(o => o[0].type === 'QuestionAnswered')
      const questionAnsweredTimestamp = questionAnsweredArg[0].clientTimestamp
      if (!questionAnsweredTimestamp || !answerTimestamp) {
        fail('Missing timestamp')
      }
      expect(answerDateTime.getTime()).toBeLessThanOrEqual(questionAnsweredTimestamp.getTime())
    })
  })

  describe('#preSendTimeoutEvent', () => {
    it('stores the answer', () => {
      component.answer = '7'
      auditServiceSpy.calls.reset()
      component.preSendTimeoutEvent()
      expect(answerServiceSpy).toHaveBeenCalled()
    })
  })
})
