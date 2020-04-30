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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpokenQuestionComponent ],
      providers: [
        AnswerService,
        { provide: AuditService, useClass: AuditServiceMock },
        WindowRefService,
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: RegisterInputService, useClass: RegisterInputServiceMock },
        { provide: SpeechService, useClass: SpeechServiceMock },
        StorageService
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
});
