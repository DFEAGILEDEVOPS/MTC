import { async, ComponentFixture, TestBed } from '@angular/core/testing';

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

describe('SpokenPracticeQuestionComponent', () => {
  let component: SpokenPracticeQuestionComponent;
  let fixture: ComponentFixture<SpokenPracticeQuestionComponent>;
  let speechService, auditService, storageService;
  let answerService: AnswerService;
  let answerServiceSpy: any;
  let registerInputService: RegisterInputService;
  let registerInputServiceSpy: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpokenPracticeQuestionComponent ],
      providers: [
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: AuditService, useClass: AuditServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: RegisterInputService, useClass: RegisterInputServiceMock },
        StorageService,
        WindowRefService,
        AnswerService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpokenPracticeQuestionComponent);
    component = fixture.componentInstance;
    speechService = fixture.debugElement.injector.get(SpeechService);
    auditService = fixture.debugElement.injector.get(AuditService);
    storageService = fixture.debugElement.injector.get(StorageService);

    answerService = fixture.debugElement.injector.get(AnswerService);
    answerServiceSpy = spyOn(answerService, 'setAnswer');

    spyOn(speechService, 'speakQuestion');
    spyOn(auditService, 'addEntry');

    registerInputService = fixture.debugElement.injector.get(RegisterInputService);
    registerInputServiceSpy = spyOn(registerInputService, 'addEntry');

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
  });

  describe('handleKeyboardEvent', () => {
    function dispatchKeyEvent(keyboardDict) {
      const event = new KeyboardEvent('keydown', keyboardDict);
      event.initEvent('keydown', true, true);
      document.dispatchEvent(event);
      return event;
    }

    it('does not add to the answer after submission', () => {
      component.startTimer();
      const event1 = dispatchKeyEvent({ key: '1' });
      const event2 = dispatchKeyEvent({ key: '2' });
      const event3 = dispatchKeyEvent({ key: '3' });
      expect(component.answer).toBe('123');
      component.onSubmit(); // press enter
      const event4 = dispatchKeyEvent({ key: '4' });
      expect(component.answer).toBe('123');
    });

    it('does not register key strokes for warm up questions', () => {
      component.startTimer();
      const event1 = dispatchKeyEvent({ key: '1' });
      const event2 = dispatchKeyEvent({ key: '2' });
      const event3 = dispatchKeyEvent({ key: '3' });
      expect(component.answer).toBe('123');
      component.onSubmit(); // press enter
      const event4 = dispatchKeyEvent({ key: 'r' });
      expect(registerInputServiceSpy.calls.count()).toBe(0);
    });
  });
});
