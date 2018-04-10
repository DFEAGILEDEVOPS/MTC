import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { RegisterInputServiceMock } from '../services/register-input/register-input-service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { SpokenQuestionComponent } from './spoken-question.component';
import { WindowRefService } from '../services/window-ref/window-ref.service';

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
        { provide: RegisterInputService, useClass: RegisterInputServiceMock },
        { provide: SpeechService, useClass: SpeechServiceMock }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpokenQuestionComponent);
    component = fixture.componentInstance;

    // Mock out the soundComponent that should be passed in as an Input
    component.soundComponent = {
      playEndOfQuestionSound() {},
      playTimeRunningOutAlertSound() {}
    };

    // Get a ref to services for easy spying
    speechService = fixture.debugElement.injector.get(SpeechService);
    // prevent SpeechServiceMock from calling 'end' by default
    spyOn(speechService, 'speak');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts speaking the question straight away', ()  => {
    expect(speechService.speak).toHaveBeenCalledTimes(1);
  });

  describe ('the timer', () => {
    it ('does not start straight away', () => {
      expect(component['timeout']).toBeUndefined();
      expect(component['countdownTimer']).toBeUndefined();
    });

    it('starts after the speech has ended', () => {
      speechService.speechStatusSource.next(SpeechServiceMock.speechEnded);
      expect(component['timeout']).toBeDefined();
      expect(component['countdownInterval']).toBeTruthy();
    });
  });
});
