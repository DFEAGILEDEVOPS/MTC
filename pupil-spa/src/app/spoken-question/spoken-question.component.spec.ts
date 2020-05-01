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
import { SpokenQuestionComponent } from './spoken-question.component';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

describe('SpokenQuestionComponent', () => {
  let component: SpokenQuestionComponent;
  let fixture: ComponentFixture<SpokenQuestionComponent>;
  let speechService, storageService, answerService;
  let answerServiceSpy: any;
  let registerInputService: RegisterInputService;
  let registerInputServiceSpy: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpokenQuestionComponent ],
      providers: [
        { provide: AuditService, useClass: AuditServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: RegisterInputService, useClass: RegisterInputServiceMock },
        { provide: SpeechService, useClass: SpeechServiceMock },
        AnswerService,
        StorageService,
        WindowRefService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpokenQuestionComponent);
    component = fixture.componentInstance;
    component.soundComponent = new SoundComponentMock();
    // Get a ref to services for easy spying
    speechService = fixture.debugElement.injector.get(SpeechService);
    storageService = fixture.debugElement.injector.get(StorageService);
    answerService = fixture.debugElement.injector.get(AnswerService);
    // prevent SpeechServiceMock from calling 'end' by default
    spyOn(speechService, 'speakQuestion');
    answerServiceSpy = spyOn(answerService, 'setAnswer');
    registerInputService = fixture.debugElement.injector.get(RegisterInputService);
    registerInputServiceSpy = spyOn(registerInputService, 'addEntry');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts speaking the question straight away', ()  => {
    expect(speechService.speakQuestion).toHaveBeenCalledTimes(1);
  });

  describe ('the timer', () => {
    it ('does not start straight away', () => {
      expect(component['timeout']).toBeUndefined();
      expect(component['countdownTimer']).toBeUndefined();
    });

    it('starts after the speech has ended', () => {
      speechService.speechStatusSource.next(SpeechServiceMock.questionSpeechEnded);
      expect(component['timeout']).toBeDefined();
      expect(component['countdownInterval']).toBeTruthy();
    });
  });

  describe('#preSendTimeoutEvent', () => {
    it('stores the answer', () => {
      component.answer = '6';
      component.preSendTimeoutEvent();
      expect(answerServiceSpy).toHaveBeenCalled();
    });
  });

  describe('handleKeyboardEvent', () => {
    function dispatchKeyEvent(keyboardDict) {
      const event = new KeyboardEvent('keydown', keyboardDict);
      event.initEvent('keydown', true, true);
      document.dispatchEvent(event);
      return event;
    }

    it('does not register key strokes after submission', () => {
      component.startTimer();
      dispatchKeyEvent({ key: '1' });
      dispatchKeyEvent({ key: '2' });
      dispatchKeyEvent({ key: '3' });
      expect(component.answer).toBe('123');
      component.onSubmit(); // press enter
      dispatchKeyEvent({ key: '4' });
      expect(registerInputServiceSpy.calls.count()).toBe(3); // 4th one is ignored after enter is pressed
      // That last key press should not be registered in the answer either
      expect(component.answer).toBe('123');
    });
  });
});
