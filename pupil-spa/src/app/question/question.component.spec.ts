import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerService } from '../services/answer/answer.service';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { QuestionComponent } from './question.component';
import { QuestionRendered, QuestionAnswered, QuestionTimerStarted, QuestionTimerCancelled, AuditEntry } from '../services/audit/auditEntry';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { RegisterInputServiceMock } from '../services/register-input/register-input-service.mock';
import { SoundComponentMock } from '../sound/sound-component-mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import {audit} from 'rxjs/operators';

describe('QuestionComponent', () => {
  let component: QuestionComponent;
  let fixture: ComponentFixture<QuestionComponent>;
  const auditServiceMock = new AuditServiceMock();
  let registerInputService: RegisterInputService;
  let answerService: AnswerService;
  let answerServiceSpy: any;
  let auditService: AuditService;
  let auditServiceSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [ QuestionComponent ],
      providers: [
        { provide: AuditService, useValue: auditServiceMock },
        AnswerService,
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        StorageService,
        WindowRefService,
        { provide: RegisterInputService, useClass: RegisterInputServiceMock }
      ]
    }).compileComponents().catch(error => { console.error(error); });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionComponent);
    component = fixture.componentInstance;
    component.soundComponent = new SoundComponentMock();
    spyOn(component, 'handleTouchEvent').and.callThrough();
    spyOn(component, 'handleMouseEvent').and.callThrough();

    // This is the best way to get the injected service, the way that _always_ _works_
    // https://angular.io/guide/testing#get-injected-services
    registerInputService = fixture.debugElement.injector.get(RegisterInputService);
    spyOn(registerInputService, 'addEntry');

    answerService = fixture.debugElement.injector.get(AnswerService);
    answerServiceSpy = spyOn(answerService, 'setAnswer');

    auditService = fixture.debugElement.injector.get(AuditService);
    auditServiceSpy = spyOn(auditService, 'addEntry');

    // Place this last so the spies above are registered.
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('handleMouseEvent', () => {
    function dispatchMouseEvent() {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      document.dispatchEvent(event);
    }

    it('tracks mousedown events', () => {
      dispatchMouseEvent();
      expect(component.handleMouseEvent).toHaveBeenCalledTimes(1);
      expect(registerInputService.addEntry).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleTouchEvent', () => {
    function dispatchTouchEvent() {
      const event = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      document.dispatchEvent(event);
    }

    it('tracks touch events', () => {
      dispatchTouchEvent();
      expect(component.handleTouchEvent).toHaveBeenCalledTimes(1);
      expect(registerInputService.addEntry).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleKeyboardEvent', () => {
    function dispatchKeyEvent(keyboardDict) {
      const event = new KeyboardEvent('keydown', keyboardDict);
      event.initEvent('keydown', true, true);
      document.dispatchEvent(event);
      return event;
    }

    it('adds to the answer when a number is given', () => {
      spyOn(component, 'handleKeyboardEvent').and.callThrough();
      const event1 = dispatchKeyEvent({ key: '1' });
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(1);
      expect(component.handleKeyboardEvent).toHaveBeenCalledWith(event1);
      expect(component.answer).toBe('1');
    });

    it('keyboard calls deleteChar when pressing Backspace or Delete', () => {
      spyOn(component, 'handleKeyboardEvent').and.callThrough();
      spyOn(component, 'deleteChar').and.callThrough();
      dispatchKeyEvent({ key: '1' });
      dispatchKeyEvent({ key: '4' });
      dispatchKeyEvent({ key: '7' });
      expect(component.answer).toBe('147');
      dispatchKeyEvent({ key: 'Backspace' });
      expect(component.deleteChar).toHaveBeenCalledTimes(1);
      expect(component.answer).toBe('14');
      dispatchKeyEvent({ key: 'Delete' });
      expect(component.answer).toBe('1');
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(5);
    });

    it('keyboard calls deleteChar when pressing "Del"', () => {
      spyOn(component, 'handleKeyboardEvent').and.callThrough();
      spyOn(component, 'deleteChar').and.callThrough();
      dispatchKeyEvent({ key: '1' });
      dispatchKeyEvent({ key: '0' });
      expect(component.answer).toBe('10');
      dispatchKeyEvent({ key: 'Del' });
      expect(component.answer).toBe('1');
    });

    it('keyboard calls OnSubmit() when Enter is pressed (if there is an answer)', () => {
      spyOn(component, 'handleKeyboardEvent').and.callThrough();
      spyOn(component, 'onSubmit').and.returnValue(null);
      dispatchKeyEvent({ key: '1' });
      dispatchKeyEvent({ key: 'Enter' });
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(2);
      expect(component.onSubmit).toHaveBeenCalledTimes(1);
      expect(component.answer).toBe('1');
    });

    it('keyboard accepts numbers', () => {
      spyOn(component, 'handleKeyboardEvent').and.callThrough();
      spyOn(component, 'addChar').and.callThrough();
      dispatchKeyEvent({ key: '0' });
      dispatchKeyEvent({ key: '1' });
      dispatchKeyEvent({ key: '2' });
      dispatchKeyEvent({ key: '3' });
      dispatchKeyEvent({ key: '4' });
      expect(component.answer).toBe('01234');
      dispatchKeyEvent({ key: 'Backspace' });
      dispatchKeyEvent({ key: 'Backspace' });
      dispatchKeyEvent({ key: 'Backspace' });
      dispatchKeyEvent({ key: 'Backspace' });
      dispatchKeyEvent({ key: 'Backspace' });
      expect(component.answer).toBe('');
      dispatchKeyEvent({ key: '5' });
      dispatchKeyEvent({ key: '6' });
      dispatchKeyEvent({ key: '7' });
      dispatchKeyEvent({ key: '8' });
      dispatchKeyEvent({ key: '9' });
      expect(component.answer).toBe('56789');
    });

    it('calls register input service for each keypress', () => {
      spyOn(component, 'handleKeyboardEvent').and.callThrough();
      dispatchKeyEvent({ key: '5' });
      dispatchKeyEvent({ key: 'f' });
      dispatchKeyEvent({ key: 'Enter' });
      dispatchKeyEvent({ key: ' ' }); // space bar
      dispatchKeyEvent({ key: 'Control' });
      expect(registerInputService.addEntry).toHaveBeenCalledTimes(5);
    });
  });

  describe('audit entry', () => {
    it('is added on question rendered', () => {
      component.sequenceNumber = 1;
      component.factor1 = 2;
      component.factor2 = 3;
      auditServiceSpy.calls.reset();
      component.ngAfterViewInit();
      expect(auditServiceSpy).toHaveBeenCalledTimes(2); // two times, timer event + render event
      const auditEntryArgs = auditServiceSpy.calls.allArgs();
      const questionRendered = auditEntryArgs.find(o => o[0].type === 'QuestionRendered');
      expect((<any> questionRendered[0].data).sequenceNumber).toBe(1);
      expect((<any> questionRendered[0].data).question).toBe('2x3');
    });

    it('is added on answer submitted', () => {
      component.sequenceNumber = 1;
      component.factor1 = 2;
      component.factor2 = 3;
      component.answer = '42';
      auditServiceSpy.calls.reset();
      component.onSubmit();
      expect(auditServiceSpy).toHaveBeenCalledTimes(2); // two times, timer event + answer event
      const auditEntryArgs = auditServiceSpy.calls.allArgs();
      const auditEntryArg = auditEntryArgs.find(o => o[0].type === 'QuestionAnswered');
      const auditEntryInserted = auditEntryArg &&  auditEntryArg[0];
      expect(auditEntryInserted instanceof QuestionAnswered
            || auditEntryInserted instanceof QuestionTimerCancelled).toBeTruthy();
      expect((<any> auditEntryInserted.data).sequenceNumber).toBe(1);
      expect((<any> auditEntryInserted.data).question).toBe('2x3');
    });
  });

  describe('#onClickAnswer', () => {
    it('calls registerInputService', () => {
      spyOn(registerInputService, 'storeEntry');
      const event = { timeStamp: 1519211809934 };
      component.onClickAnswer(42, event);
      expect(registerInputService.storeEntry).toHaveBeenCalledTimes(1);
      expect(registerInputService.storeEntry).toHaveBeenCalledWith('42', 'click', 0, '0x0', 1519211809934);
    });

    it('adds the number to the answer', () => {
      const event = {};
      component.onClickAnswer(9, event);
      expect(component['answer']).toBe('9');
    });
  });

  describe('#onClickBackspace', () => {
    it('calls registerInputService', () => {
      spyOn(registerInputService, 'storeEntry');
      component.sequenceNumber = 1;
      component.factor1 = 1;
      component.factor2 = 2;
      const event = { timeStamp: 1519211809934 };
      component.onClickBackspace(event);
      expect(registerInputService.storeEntry).toHaveBeenCalledTimes(1);
      expect(registerInputService.storeEntry).toHaveBeenCalledWith('Backspace', 'click', 1, '1x2', 1519211809934);
    });

    it('deletes a char from the answer', () => {
      component['answer'] = '1444';
      const event = {};
      component.onClickBackspace(event);
      expect(component['answer']).toBe('144');
    });
  });

  describe('#onClickSubmit', () => {
    it('calls registerInputService', () => {
      spyOn(registerInputService, 'storeEntry');
      component.sequenceNumber = 1;
      component.factor1 = 1;
      component.factor2 = 2;
      const event = { timeStamp: 1519211809934 };
      component.onClickSubmit(event);
      expect(registerInputService.storeEntry).toHaveBeenCalledTimes(1);
      expect(registerInputService.storeEntry).toHaveBeenCalledWith('Enter', 'click', 1, '1x2', 1519211809934);
    });

    it('calls onSubmit()', () => {
      spyOn(component, 'onSubmit');
      const event = {};
      component.onClickSubmit(event);
      expect(component.onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('#onSubmit', () => {
    it('stores the answer when submit is pressed', () => {
      component.answer = '9';
      auditServiceSpy.calls.reset();
      component.onSubmit();
      expect(answerServiceSpy).toHaveBeenCalled();
    });

    it('stores the answer before it stores the QuestionAnswered Audit', () => {
      component.answer = '8';
      auditServiceSpy.calls.reset();
      component.onSubmit();
      const answerTimestamp = answerServiceSpy.calls.mostRecent().args[0].clientTimestamp;
      const auditArgs = auditServiceSpy.calls.allArgs();
      const questionAnsweredArg = auditArgs.find(o => o[0].type === 'QuestionAnswered');
      const questionAnsweredTimestamp = questionAnsweredArg[0].clientTimestamp;
      if (!questionAnsweredTimestamp || !answerTimestamp) {
        fail('Missing timestamp');
      }
      expect(answerTimestamp.getTime()).toBeGreaterThanOrEqual(questionAnsweredTimestamp.getTime());
    });
  });

  describe('#preSendTimeoutEvent', () => {
    it('stores the answer', () => {
      component.answer = '7';
      auditServiceSpy.calls.reset();
      component.preSendTimeoutEvent();
      expect(answerServiceSpy).toHaveBeenCalled();
    });
  });
});
