import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { QuestionComponent } from './question.component';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { QuestionRendered, QuestionAnswered, AuditEntry } from '../services/audit/auditEntry';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { RegisterInputServiceMock } from '../services/register-input/register-input-service.mock';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { StorageService } from '../services/storage/storage.service';
import { StorageServiceMock } from '../services/storage/storage.service.mock';
import { SubmissionService } from '../services/submission/submission.service';
import { SubmissionServiceMock } from '../services/submission/submission.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { WindowRefService } from '../services/window-ref/window-ref.service';


describe('QuestionComponent', () => {
  let component: QuestionComponent;
  let fixture: ComponentFixture<QuestionComponent>;
  const auditServiceMock = new AuditServiceMock();
  let registerInputService: RegisterInputService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule ],
      declarations: [ QuestionComponent ],
      providers: [
        { provide: AuditService, useValue: auditServiceMock },
        WindowRefService,
        { provide: RegisterInputService, useClass: RegisterInputServiceMock }
      ]
    }).compileComponents().catch(error => { console.error(error); });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionComponent);
    component = fixture.componentInstance;
    spyOn(component, 'handleTouchEvent').and.callThrough();
    spyOn(component, 'handleMouseEvent').and.callThrough();

    // This is the best way to get the injected service, the way that _always_ _works_
    // https://angular.io/guide/testing#get-injected-services
    registerInputService = fixture.debugElement.injector.get(RegisterInputService);
    spyOn(registerInputService, 'addEntry');

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
    let auditEntryInserted: AuditEntry;
    beforeEach(() => {
      const auditService = fixture.debugElement.injector.get(AuditService);
      spyOn(auditService, 'addEntry').and.callFake((entry) => {
        auditEntryInserted = entry;
      });
    });
    it('is added on question rendered', () => {
      component.ngAfterViewInit();
      expect(auditServiceMock.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof QuestionRendered).toBeTruthy();
    });

    it('is added on answer submitted', () => {
      component.answer = '42';
      component.onSubmit();
      expect(auditServiceMock.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof QuestionAnswered).toBeTruthy();
    });
  });

  describe('#onClickAnswer', () => {
    it('calls registerInputService', () => {
      spyOn(registerInputService, 'storeEntry');
      component.onClickAnswer(42);
      expect(registerInputService.storeEntry).toHaveBeenCalledTimes(1);
    });

    it('adds the number to the answer', () => {
      component.onClickAnswer(9);
      expect(component['answer']).toBe('9');
    });
  });

  describe('#onClickBackspace', () => {
    it('calls registerInputService', () => {
      spyOn(registerInputService, 'storeEntry');
      component.onClickBackspace();
      expect(registerInputService.storeEntry).toHaveBeenCalledTimes(1);
      // It defaults to question 0 - no question
      expect(registerInputService.storeEntry).toHaveBeenCalledWith('backspace', 'click', 0);
    });

    it('deletes a char from the answer', () => {
      component['answer'] = '1444';
      component.onClickBackspace();
      expect(component['answer']).toBe('144');
    });
  });

  describe('#onClickSubnmit', () => {
    it('calls registerInputService', () => {
      spyOn(registerInputService, 'storeEntry');
      component.onClickSubmit();
      expect(registerInputService.storeEntry).toHaveBeenCalledTimes(1);
      expect(registerInputService.storeEntry).toHaveBeenCalledWith('Enter', 'click', 0);
    });

    it('calls onSubmit()', () => {
      spyOn(component, 'onSubmit');
      component.onClickSubmit();
      expect(component.onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
