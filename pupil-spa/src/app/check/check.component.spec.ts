import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing'
import { APP_INITIALIZER, NO_ERRORS_SCHEMA } from '@angular/core'

import { AnswerService } from '../services/answer/answer.service'
import { AuditEntry, AuditEntryFactory, CheckSubmissionPending, RefreshDetected } from '../services/audit/auditEntry'
import { AuditService } from '../services/audit/audit.service'
import { AuditServiceMock } from '../services/audit/audit.service.mock'
import { CheckComponent } from './check.component'
import { QuestionService } from '../services/question/question.service'
import { QuestionServiceMock } from '../services/question/question.service.mock'
import { StorageService } from '../services/storage/storage.service'
import { WarmupQuestionService } from '../services/question/warmup-question.service'
import { WindowRefService } from '../services/window-ref/window-ref.service'
import { TimerService } from '../services/timer/timer.service'
import { TimerServiceMock } from '../services/timer/timer.service.mock'
import { Router } from '@angular/router'
import { loadConfigMockService } from '../services/config/config.service'
import { MonotonicTimeService } from '../services/monotonic-time/monotonic-time.service'

describe('CheckComponent', () => {
  let component: CheckComponent
  let fixture: ComponentFixture<CheckComponent>
  let storageService
  let checkStateMock = null
  let mockRouter
  let setTimeoutSpy
  let setCheckStateSpy
  let setPendingSubmissionSpy

  function detectStateChange (object, method, arg?) {
    const beforeState = component['state']
    if (arg) {
      object[method]()
    } else {
      object[method](arg)
    }
    const afterState = component['state']
    expect(beforeState + 1).toBe(afterState)
    expect(setCheckStateSpy).toHaveBeenCalledTimes(1)
  }

  beforeEach(waitForAsync(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    }

    TestBed.configureTestingModule({
      imports: [],
      declarations: [CheckComponent],
      schemas: [NO_ERRORS_SCHEMA],         // we don't need to test sub-components
      providers: [
        { provide: AnswerService, useClass: AnswerService, deps: [ MonotonicTimeService ] },
        { provide: AuditService, useClass: AuditServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        StorageService,
        { provide: WarmupQuestionService, useClass: QuestionServiceMock },
        { provide: TimerService, useClass: TimerServiceMock },
        { provide: Router, useValue: mockRouter },
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        WindowRefService,
        AuditEntryFactory
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckComponent)
    storageService = fixture.debugElement.injector.get(StorageService)
    spyOn(storageService, 'getCheckState').and.callFake(() => checkStateMock)
    setTimeoutSpy = spyOn(storageService, 'setTimeout')
    setTimeoutSpy.and.callThrough()
    setCheckStateSpy = spyOn(storageService, 'setCheckState')
    setCheckStateSpy.and.callThrough()
    setPendingSubmissionSpy = spyOn(storageService, 'setPendingSubmission')
    setPendingSubmissionSpy.and.callThrough()
    component = fixture.componentInstance
    component.viewState = undefined
    fixture.detectChanges()
  })

  afterEach(() => {
    checkStateMock = null
  })

  it('should be created', () => {
    expect(component).toBeTruthy()
  })

  it('default view should be the warmup-intro screen', fakeAsync(() => {
    fixture.detectChanges()
    tick()
    const compiled = fixture.debugElement.nativeElement
    expect(compiled.querySelector('app-warmup-intro')).toBeTruthy()
  }))

  it('setting the viewState to question shows the question screen', fakeAsync(() => {
    component.viewState = 'question'
    const compiled = fixture.debugElement.nativeElement
    fixture.detectChanges()
    tick()
    expect(compiled.querySelector('app-question')).toBeTruthy()
  }))

  describe('manualSubmitHandler', () => {
    it('calls changeState()', () => {
      detectStateChange(component, 'manualSubmitHandler', 'testinput')
    })
  })

  describe('questionTimeoutHandler()', () => {
    it('calls changeState()', () => {
      detectStateChange(component, 'questionTimeoutHandler', 'testinput')
    })
  })

  describe('loadingTimeoutHandler', () => {
    it('increments the state', () => {
      detectStateChange(component, 'loadingTimeoutHandler')
    })
  })

  describe('handleKeyboardEvent', () => {
    function dispatchKeyEvent (keyboardDict) {
      const event = new KeyboardEvent('keyup', keyboardDict)
      event.initEvent('keyup', true, true)
      document.dispatchEvent(event)
      return event
    }

    it('cancels (nearly) all keyboard events and returns false', () => {
      spyOn(component, 'handleKeyboardEvent').and.callThrough()
      const ev1 = dispatchKeyEvent({ key: '5' })
      expect(ev1.defaultPrevented).toBe(true)
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(1)

      // Some browsers map backspace to go back a page.  If the questions times out
      // and the user presses backspace on the loading page, you guessed it, they go back
      // to the previous page. Well played, Mozilla and Microsoft.
      const ev2 = dispatchKeyEvent({ key: 'Backspace' })
      expect(ev2.defaultPrevented).toBe(true)
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(2)

      // Ordinary keys should be prevented from doing anything
      const ev3 = dispatchKeyEvent({ key: 'j' })
      expect(ev3.defaultPrevented).toBe(true)
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(3)

      // it needs to return false
      expect(component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'x' }))).toBe(false)
    })

    it('allows tab and enter keys for AX keyboard navigation', () => {
      spyOn(component, 'handleKeyboardEvent').and.callThrough()
      const ev1 = dispatchKeyEvent({ key: 'Tab' })
      expect(ev1.defaultPrevented).toBe(false)
      const ev2 = dispatchKeyEvent({ key: 'Enter' })
      expect(ev2.defaultPrevented).toBe(false)
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(2)
    })
  })

  describe('handleTouchEvent', () => {
    function dispatchTouchEvent () {
      const event = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        view: window
      })
      document.dispatchEvent(event)
      return event
    }

    it('cancels touchend events and returns false', () => {
      spyOn(component, 'handleTouchEndEvent').and.callThrough()
      const ev1 = dispatchTouchEvent()
      expect(ev1.defaultPrevented).toBe(true)
      expect(component.handleTouchEndEvent).toHaveBeenCalledTimes(1)
      expect(component.handleTouchEndEvent(ev1)).toBe(false)
    })
  })

  describe('warmup click handlers', () => {
    it('changes state for warmupIntroClickHandler()', () => {
      detectStateChange(component, 'warmupIntroClickHandler')
    })
    it('changes state for warmupCompleteClickHandler()', () => {
      detectStateChange(component, 'warmupCompleteClickHandler')
    })
  })

  describe('changeState()', () => {
    // This is a private method, but worth testing.
    function testStateChange (stateDesc: string, viewState: string, isWarmUp: boolean) {
      component['allowedStates'] = [undefined, stateDesc]
      component['state'] = 0
      component['changeState']()
      expect(component['viewState']).toBe(viewState)
      expect(component['isWarmUp']).toBe(isWarmUp)
    }

    it('shows the warmup-intro when the state is "warmup-intro"', () => {
      testStateChange('warmup-intro', 'warmup-intro', true)
    })
    it('shows the warmup loading screen when the state is "LW<digit>"', () => {
      testStateChange('LW1', 'warmup-preload', true)
    })
    it('shows the practice question when the state is "W<digit>"', () => {
      testStateChange('W1', 'practice-question', true)
    })
    it('shows the warmup complete when the state is "warmup-complete"', () => {
      testStateChange('warmup-complete', 'warmup-complete', true)
    })
    it('shows the loading page when the state is "L<digit>"', () => {
      testStateChange('L1', 'preload', false)
    })
    it('shows the question when the state is "Q<digit>"', () => {
      testStateChange('Q1', 'question', false)
    })
    it('shows the submission pending screen when the state is "submission-pending"', () => {
      testStateChange('submission-pending', 'submission-pending', false)
    })
  })

  describe('check complete state', () => {
    let auditEntryInserted: AuditEntry
    let auditService: AuditService
    beforeEach(() => {
      auditService = fixture.debugElement.injector.get(AuditService)
      spyOn(auditService, 'addEntry').and.callFake((entry) => {
        auditEntryInserted = entry
      })
    })
    it('is adding an audit entry for checkComplete', () => {
      // test setup
      component['allowedStates'] = ['Q25', 'submission-pending']
      component['state'] = 0
      // call changeState()
      component['changeState']()
      expect(auditService.addEntry).toHaveBeenCalledTimes(1)
      expect(setPendingSubmissionSpy.calls.count()).toEqual(1)
      expect(auditEntryInserted instanceof CheckSubmissionPending).toBeTruthy()
    })
  })

  describe('page refresh', () => {
    let auditEntryInserted: AuditEntry
    let auditService: AuditService
    let answerService: AnswerService
    let setAnswerSpy: jasmine.Spy

    beforeEach(() => {
      // find the state for the first warmup question
      const w1 = component['allowedStates'].indexOf('W1')

      // test setup: state returned from localstorage on init. Usually, on a clean
      // app startup this would be null.
      checkStateMock = w1

      spyOn(component, 'refreshDetected').and.callThrough()

      auditService = fixture.debugElement.injector.get(AuditService)
      spyOn(auditService, 'addEntry').and.callFake((entry) => {
        auditEntryInserted = entry
      })

      answerService = fixture.debugElement.injector.get(AnswerService)
      setAnswerSpy = spyOn(answerService, 'setAnswer').and.callFake((factor1, factor2, userAnswer, sequenceNumber) => {})
    })

    it('calls refreshDetected during init when the checkstate is found', () => {
      component.ngOnInit()
      expect(component.refreshDetected).toHaveBeenCalledTimes(1)
    })

    it('logs an audit entry to say the page was refreshed', () => {
      // set up test spy on Audit Service
      component.refreshDetected()
      // check the spy was called
      expect(auditService.addEntry).toHaveBeenCalledTimes(1)
      expect(auditEntryInserted instanceof RefreshDetected).toBeTruthy()
    })

    it('moves to the next state if a real test question was asked', () => {
      // find the state for the first warmup question
      const q1 = component['allowedStates'].indexOf('Q1')

      // test setup: state returned from localstorage on init. Usually, on a clean
      // app startup this would be null.
      checkStateMock = q1

      // exercise the code
      component.ngOnInit()

      // test
      expect(component['state']).toBe(q1 + 1)
    })

    it('state stays the same if a page refresh happens on a warmup loading screen', () => {
      // find the state for the first warmup loading screen
      const state = component['allowedStates'].indexOf('LW1')
      checkStateMock = state
      component.ngOnInit()
      expect(component['state']).toBe(state)
    })

    it('state moves on if a page refresh happens on a warmup question', () => {
      // find the state for the first warmup question
      const state = component['allowedStates'].indexOf('W1')
      checkStateMock = state
      component.ngOnInit()
      expect(component['state']).toBe(state + 1)
    })

    it('state stays the same if a page refresh happens on the warm-up intro', () => {
      // find the state for the warmup intro
      const state = component['allowedStates'].indexOf('warmup-intro')
      checkStateMock = state
      component.ngOnInit()
      expect(component['state']).toBe(state)
    })

    it('state stays the same if a page refresh happens on the warm-up complete', () => {
      // find the state for warmup-complete
      const state = component['allowedStates'].indexOf('warmup-complete')
      checkStateMock = state
      component.ngOnInit()
      expect(component['state']).toBe(state)
    })

    it('state stays the same if a page refresh happens on a loading screen', () => {
      // find the state for the loading question 2
      const state = component['allowedStates'].indexOf('L2')
      checkStateMock = state
      component.ngOnInit()
      expect(component['state']).toBe(state)
    })

    it('state stays the same if a page refresh happens on the submission pending screen', () => {
      // find the state for complete
      const state = component['allowedStates'].indexOf('submission-pending')
      checkStateMock = state
      component.ngOnInit()
      expect(component['state']).toBe(state)
    })

    it('the answer is recorded as blank when refreshing during on a question', () => {
      const state = component['allowedStates'].indexOf('Q3')
      checkStateMock = state
      component.ngOnInit()
      expect(answerService.setAnswer).toHaveBeenCalledTimes(1)
      const args = setAnswerSpy.calls.allArgs()[0]
      expect(args[2]).toBe('') // expect the 3rd arg to setAnswer to be blank
    })

    it('throws an error when the existing state is an out of range number', () => {
      const state = 100
      checkStateMock = state
      expect(function () {
        component.ngOnInit()
      }).toThrowError(/^Invalid state/)
    })

    it('throws an error when the existing state is a negative number', () => {
      const state = -1
      checkStateMock = state
      expect(function () {
        component.ngOnInit()
      }).toThrowError(/^Invalid state/)
    })

    it('throws an error when the existing state is a string', () => {
      const state = 'test'
      checkStateMock = state
      expect(function () {
        component.ngOnInit()
      }).toThrowError(/^Invalid state/)
    })

    it('throws an error when the existing state is a bool', () => {
      const state = true
      checkStateMock = state
      expect(function () {
        component.ngOnInit()
      }).toThrowError(/^Invalid state/)
    })
    describe('canDeactivate', () => {
      it('can deactivate on warmup intro view state', () => {
        component.viewState = 'warmup-intro'
        expect(component.canDeactivate()).toBeTruthy()
      })
      it('can deactivate on submission pending view state', () => {
        component.viewState = 'submission-pending'
        expect(component.canDeactivate()).toBeTruthy()
      })
      it('can deactivate on preload view state to allow out of time rendering', () => {
        component.viewState = 'preload'
        expect(component.canDeactivate()).toBeTruthy()
      })
      it('can deactivate on submission pending view state', () => {
        component.viewState = 'warmup-complete'
        expect(component.canDeactivate()).toBeTruthy()
      })
      it('cannot deactivate on any other state', () => {
        component.viewState = 'warmup-preload'
        expect(component.canDeactivate()).toBeFalsy()
        component.viewState = 'practice-question'
        expect(component.canDeactivate()).toBeFalsy()
        component.viewState = 'spoken-practice-question'
        expect(component.canDeactivate()).toBeFalsy()
        component.viewState = 'questions-intro'
        expect(component.canDeactivate()).toBeFalsy()
        component.viewState = 'question'
        expect(component.canDeactivate()).toBeFalsy()
        component.viewState = 'spoken-question'
        expect(component.canDeactivate()).toBeFalsy()
      })
    })
  })
})
