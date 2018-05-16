import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpModule } from '@angular/http';

import { Answer } from '../services/answer/answer.model';
import { AnswerService } from '../services/answer/answer.service';
import { AuditEntry, CheckSubmissionPending, RefreshDetected } from '../services/audit/auditEntry';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { CheckComponent } from './check.component';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { StorageService } from '../services/storage/storage.service';
import { StorageServiceMock } from '../services/storage/storage.service.mock';
import { SubmissionService } from '../services/submission/submission.service';
import { SubmissionServiceMock } from '../services/submission/submission.service.mock';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

describe('CheckComponent', () => {
  let component: CheckComponent;
  let fixture: ComponentFixture<CheckComponent>;
  let storageService;
  let checkStateMock = null;

  function detectStateChange(object, method, arg?) {
    const beforeState = component[ 'state' ];
    if (arg) {
      object[ method ]();
    } else {
      object[ method ](arg);
    }
    const afterState = component[ 'state' ];
    expect(beforeState + 1).toBe(afterState);
    expect(storageService.setItem).toHaveBeenCalledTimes(1);
  }

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [ HttpModule ],
      declarations: [ CheckComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],         // we don't need to test sub-components
      providers: [
        AnswerService,
        { provide: AuditService, useClass: AuditServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: StorageService, useClass: StorageServiceMock },
        { provide: SubmissionService, useClass: SubmissionServiceMock },
        { provide: WarmupQuestionService, useClass: QuestionServiceMock },
        WindowRefService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckComponent);
    storageService = fixture.debugElement.injector.get(StorageService);
    spyOn(storageService, 'getItem').and.callFake((arg) => {
      if (arg === 'checkstate') {
        // By default assume that there is no previous checkstate
        // we can change this to a valid state number to simulate
        // a page refresh.
        return checkStateMock;
      } else {
        return [];
      }
    });
    spyOn(storageService, 'setItem').and.callThrough();
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    checkStateMock = null;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('default view should be the warmup-intro screen', () => {
    fixture.whenStable().then(() => {
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('app-warmup-intro')).toBeTruthy();
    });
  });

  xit('setting the viewState to question shows the question screen', () => {
    component.viewState = 'question';
    fixture.whenStable().then(() => {
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('app-question')).toBeTruthy();
      // console.log(compiled);
    });
  });

  xit('setting the viewState to complete shows the check complete screen', () => {
    component.viewState = 'complete';
    fixture.whenStable().then(() => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('app-check-complete')).toBeTruthy();
      }
    );
  });

  describe('manualSubmitHandler', () => {
    it('calls changeState()', () => {
      detectStateChange(component, 'manualSubmitHandler', 'testinput');
    });
  });

  describe('questionTimeoutHandler()', () => {
    it('calls changeState()', () => {
      detectStateChange(component, 'questionTimeoutHandler', 'testinput');
    });
    it('sets the answer if it is a real question', () => {
      const answerService = fixture.debugElement.injector.get(AnswerService);
      spyOn(answerService, 'setAnswer');
      component[ 'isWarmUp' ] = false;
      component.questionTimeoutHandler('123');
      expect(answerService.setAnswer).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadingTimeoutHandler', () => {
    it('increments the state', () => {
      detectStateChange(component, 'loadingTimeoutHandler');
    });
  });

  describe('handleKeyboardEvent', () => {
    function dispatchKeyEvent(keyboardDict) {
      const event = new KeyboardEvent('keydown', keyboardDict);
      event.initEvent('keydown', true, true);
      document.dispatchEvent(event);
      return event;
    }

    it('cancels (nearly) all keyboard events and returns false', () => {
      spyOn(component, 'handleKeyboardEvent').and.callThrough();
      const ev1 = dispatchKeyEvent({ key: '5' });
      expect(ev1.defaultPrevented).toBe(true);
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(1);

      // Some browsers map backspace to go back a page.  If the questions times out
      // and the user presses backspace on the loading page, you guessed it, thay go back
      // to the previous page. Well played, Mozilla and Microsoft.
      const ev2 = dispatchKeyEvent({ key: 'Backspace' });
      expect(ev2.defaultPrevented).toBe(true);
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(2);

      // Ordinary keys should be prevented from doing anything
      const ev3 = dispatchKeyEvent({ key: 'j' });
      expect(ev3.defaultPrevented).toBe(true);
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(3);

      // it needs to return false
      expect(component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'x' }))).toBe(false);
    });

    it ('allows tab and enter keys for AX keyboard navigation', () => {
      spyOn(component, 'handleKeyboardEvent').and.callThrough();
      const ev1 = dispatchKeyEvent({key: 'Tab'});
      expect(ev1.defaultPrevented).toBe(false);
      const ev2 = dispatchKeyEvent({key: 'Enter'});
      expect(ev2.defaultPrevented).toBe(false);
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleTouchEvent', () => {
    function dispatchTouchEvent() {
      const event = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      document.dispatchEvent(event);
      return event;
    }

    it('cancels touchend events and returns false', () => {
      spyOn(component, 'handleTouchEndEvent').and.callThrough();
      const ev1 = dispatchTouchEvent();
      expect(ev1.defaultPrevented).toBe(true);
      expect(component.handleTouchEndEvent).toHaveBeenCalledTimes(1);
      expect(component.handleTouchEndEvent(ev1)).toBe(false);
    });
  });

  describe('warmup click handlers', () => {
    it('changes state for warmupIntroClickHandler()', () => {
      detectStateChange(component, 'warmupIntroClickHandler');
    });
    it('changes state for warmupCompleteClickHandler()', () => {
      detectStateChange(component, 'warmupCompleteClickHandler');
    });
  });

  describe('changeState()', () => {
    // This is a private method, but worth testing.
    function testStateChange(stateDesc: string, viewState: string, isWarmUp: boolean) {
      component[ 'allowedStates' ] = [ undefined, stateDesc ];
      component[ 'state' ] = 0;
      component[ 'changeState' ]();
      expect(component[ 'viewState' ]).toBe(viewState);
      expect(component[ 'isWarmUp' ]).toBe(isWarmUp);
    }

    it('shows the warmup-intro when the state is "warmup-intro"', () => {
      testStateChange('warmup-intro', 'warmup-intro', true);
    });
    it('shows the warmup loading screen when the state is "LW<digit>"', () => {
      testStateChange('LW1', 'warmup-preload', true);
    });
    it('shows the practice question when the state is "W<digit>"', () => {
      testStateChange('W1', 'practice-question', true);
    });
    it('shows the warmup complete when the state is "warmup-complete"', () => {
      testStateChange('warmup-complete', 'warmup-complete', true);
    });
    it('shows the loading page when the state is "L<digit>"', () => {
      testStateChange('L1', 'preload', false);
    });
    it('shows the question when the state is "Q<digit>"', () => {
      testStateChange('Q1', 'question', false);
    });
    it('shows the submission pending screen when the state is "submission-pending"', () => {
      testStateChange('submission-pending', 'submission-pending', false);
    });
  });

  describe('check complete state', () => {
    let auditEntryInserted: AuditEntry;
    let auditService: AuditService;
    beforeEach(() => {
      auditService = fixture.debugElement.injector.get(AuditService);
      spyOn(auditService, 'addEntry').and.callFake((entry) => {
        auditEntryInserted = entry;
      });
    });
    it('is adding an audit entry for checkComplete', () => {
      // test setup
      component['allowedStates'] = ['Q25', 'submission-pending'];
      component['state'] = 0;
      // call changeState()
      component['changeState']();

      expect(auditService.addEntry).toHaveBeenCalledTimes(1);
      expect(storageService.setItem).toHaveBeenCalledWith(  'pending_submission', true );
      expect(auditEntryInserted instanceof CheckSubmissionPending).toBeTruthy();
    });
  });

  describe('page refresh', () => {
    let auditEntryInserted: AuditEntry;
    let auditService: AuditService;
    let answerService: AnswerService;
    let answerInserted: Answer;

    beforeEach(() => {
      // find the state for the first warmup question
      const w1 = component['allowedStates'].indexOf('W1');

      // test setup: state returned from localstorage on init. Usually, on a clean
      // app startup this would be null.
      checkStateMock = w1;

      spyOn(component, 'refreshDetected').and.callThrough();

      auditService = fixture.debugElement.injector.get(AuditService);
      spyOn(auditService, 'addEntry').and.callFake((entry) => {
        auditEntryInserted = entry;
      });

      answerService = fixture.debugElement.injector.get(AnswerService);
      spyOn(answerService, 'setAnswer').and.callFake((ans) => {
        answerInserted = ans;
      });
    });

    it('calls refreshDetected during init when the checkstate is found', () => {
      component.ngOnInit();
      expect(component.refreshDetected).toHaveBeenCalledTimes(1);
    });

    it('logs an audit entry to say the page was refreshed', () => {
      // set up test spy on Audit Service
      component.refreshDetected();
      // check the spy was called
      expect(auditService.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof RefreshDetected).toBeTruthy();
    });

    it('moves to the next state if a real test question was asked', () => {
      // find the state for the first warmup question
      const q1 = component['allowedStates'].indexOf('Q1');

      // test setup: state returned from localstorage on init. Usually, on a clean
      // app startup this would be null.
      checkStateMock = q1;

      // exercise the code
      component.ngOnInit();

      // test
      expect(component['state']).toBe(q1 + 1);
    });

    it('state stays the same if a page refresh happens on a warmup loading screen', () => {
      // find the state for the first warmup loading screen
      const state = component['allowedStates'].indexOf('LW1');
      checkStateMock = state;
      component.ngOnInit();
      expect(component['state']).toBe(state);
    });

    it('state moves on if a page refresh happens on a warmup question', () => {
      // find the state for the first warmup question
      const state = component['allowedStates'].indexOf('W1');
      checkStateMock = state;
      component.ngOnInit();
      expect(component['state']).toBe(state + 1);
    });

    it('state stays the same if a page refresh happens on the warm-up intro', () => {
      // find the state for the warmup intro
      const state = component['allowedStates'].indexOf('warmup-intro');
      checkStateMock = state;
      component.ngOnInit();
      expect(component['state']).toBe(state);
    });

    it('state stays the same if a page refresh happens on the warm-up complete', () => {
      // find the state for warmup-complete
      const state = component['allowedStates'].indexOf('warmup-complete');
      checkStateMock = state;
      component.ngOnInit();
      expect(component['state']).toBe(state);
    });

    it('state stays the same if a page refresh happens on a loading screen', () => {
      // find the state for the loading question 2
      const state = component['allowedStates'].indexOf('L2');
      checkStateMock = state;
      component.ngOnInit();
      expect(component['state']).toBe(state);
    });

    it('state stays the same if a page refresh happens on the submission pending screen', () => {
      // find the state for complete
      const state = component['allowedStates'].indexOf('submission-pending');
      checkStateMock = state;
      component.ngOnInit();
      expect(component['state']).toBe(state);
    });

    it('the answer is recorded as blank when refreshing during on a question', () => {
      const state = component['allowedStates'].indexOf('Q3');
      checkStateMock = state;
      component.ngOnInit();
      expect(answerService.setAnswer).toHaveBeenCalledTimes(1);
      expect(answerInserted.answer).toBe('');
    });

    it('throws an error when the existing state is an out of range number', () => {
      const state = 100;
      checkStateMock = state;
      expect(function() { component.ngOnInit(); }).toThrowError(/^Invalid state/);
    });

    it('throws an error when the existing state is a negative number', () => {
      const state = -1;
      checkStateMock = state;
      expect(function() { component.ngOnInit(); }).toThrowError(/^Invalid state/);
    });

    it('throws an error when the existing state is a string', () => {
      const state = 'test';
      checkStateMock = state;
      expect(function() { component.ngOnInit(); }).toThrowError(/^Invalid state/);
    });

    it('throws an error when the existing state is a bool', () => {
      const state = true;
      checkStateMock = state;
      expect(function() { component.ngOnInit(); }).toThrowError(/^Invalid state/);
    });

  });
});
