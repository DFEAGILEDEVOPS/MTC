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
});
