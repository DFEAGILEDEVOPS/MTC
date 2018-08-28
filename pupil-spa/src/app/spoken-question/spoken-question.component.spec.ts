import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { RegisterInputServiceMock } from '../services/register-input/register-input-service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { SpokenQuestionComponent } from './spoken-question.component';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SoundComponentMock } from '../sound/sound-component-mock';

describe('SpokenQuestionComponent', () => {
  let component: SpokenQuestionComponent;
  let fixture: ComponentFixture<SpokenQuestionComponent>;
  let speechService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpokenQuestionComponent ],
      providers: [
        { provide: AuditService, useClass: AuditServiceMock },
        WindowRefService,
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: RegisterInputService, useClass: RegisterInputServiceMock },
        { provide: SpeechService, useClass: SpeechServiceMock }
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
    // prevent SpeechServiceMock from calling 'end' by default
    spyOn(speechService, 'speakQuestion');

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
});
