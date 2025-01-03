import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnswerService } from '../services/answer/answer.service';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { RegisterInputServiceMock } from '../services/register-input/register-input-service.mock';
import { SoundComponentMock } from '../sound/sound-component-mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { SpokenPracticeQuestionComponent } from './spoken-practice-question.component';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { MonotonicTimeService } from '../services/monotonic-time/monotonic-time.service'
import { AuditEntryFactory } from '../services/audit/auditEntry'

describe('SpokenPracticeQuestionComponent', () => {
  let component: SpokenPracticeQuestionComponent;
  let fixture: ComponentFixture<SpokenPracticeQuestionComponent>;
  let speechService, auditService;
  let answerService: AnswerService;
  let registerInputService: RegisterInputService;
  let registerInputServiceSpy: any;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SpokenPracticeQuestionComponent ],
      providers: [
        { provide: AuditService, useClass: AuditServiceMock },
        WindowRefService,
        { provide: SpeechService, useClass: SpeechServiceMock },
        StorageService,
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: AnswerService, useClass: AnswerService, deps: [ MonotonicTimeService ]},
        { provide: RegisterInputService, useClass: RegisterInputServiceMock },
        AuditEntryFactory
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpokenPracticeQuestionComponent);
    component = fixture.componentInstance;
    speechService = fixture.debugElement.injector.get(SpeechService);
    auditService = fixture.debugElement.injector.get(AuditService);

    answerService = fixture.debugElement.injector.get(AnswerService);
    spyOn(answerService, 'setAnswer');
    spyOn(speechService, 'speakQuestion');
    spyOn(auditService, 'addEntry');

    registerInputService = fixture.debugElement.injector.get(RegisterInputService);
    registerInputServiceSpy = spyOn(registerInputService, 'storeEntry');

    component.soundComponent = new SoundComponentMock();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should write an audit entry to show the question was rendered', () => {
    expect(auditService.addEntry).toHaveBeenCalledTimes(1);
  });

  it('should start speaking straight away', () => {
    expect(speechService.speakQuestion).toHaveBeenCalledTimes(1);
  });

  describe ('the timer', () => {
    it ('does not start straight away', () => {
      expect(component['timeout']).toBeUndefined();
      expect(component['countdownTimer']).toBeUndefined();
    });

    it('starts after the speech has ended', () => {
      try {
        speechService.speechStatusSource.next(SpeechServiceMock.questionSpeechEnded);
        expect(component['timeout']).toBeDefined();
        expect(component['countdownInterval']).toBeTruthy();
      } catch (error) {
        fail(error);
      }
    });

    it('cleans up the timers on destroy', async () => {
      // @ts-expect-error: protected property
      component.countdownInterval = 1
      // @ts-expect-error: protected property
      component.timeout = 2
      const spy1 = spyOn(window, 'clearInterval')
      const spy2 = spyOn(window, 'clearTimeout')
      await component.ngOnDestroy()
      expect(spy1).toHaveBeenCalledWith(1)
      expect(spy2).toHaveBeenCalledWith(2)
    })
  });

  describe('handleKeyboardEvent', () => {
    function dispatchKeyEvent(keyboardDict) {
      keyboardDict.bubbles ??= true
      keyboardDict.cancelable ??= true
      const event = new KeyboardEvent('keyup', keyboardDict);
      document.dispatchEvent(event);
      return event;
    }

    it('does not add to the answer after submission', () => {
      component.startTimer();
      dispatchKeyEvent({ key: '1' });
      dispatchKeyEvent({ key: '2' });
      dispatchKeyEvent({ key: '3' });
      expect(component.answer).toBe('123');
      component.onSubmit(); // press enter
      dispatchKeyEvent({ key: '4' });
      expect(component.answer).toBe('123');
    });

    it('does not register key strokes for warm up questions', () => {
      component.startTimer();
      dispatchKeyEvent({ key: '1' });
      dispatchKeyEvent({ key: '2' });
      dispatchKeyEvent({ key: '3' });
      expect(component.answer).toBe('123');
      component.onSubmit(); // press enter
      dispatchKeyEvent({ key: 'r' });
      expect(registerInputServiceSpy.calls.count()).toBe(0);
    });
  });
});
