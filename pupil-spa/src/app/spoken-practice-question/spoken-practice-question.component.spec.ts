import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpokenPracticeQuestionComponent } from './spoken-practice-question.component';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { WindowRefService } from '../services/window-ref/window-ref.service';

describe('SpokenPracticeQuestionComponent', () => {
  let component: SpokenPracticeQuestionComponent;
  let fixture: ComponentFixture<SpokenPracticeQuestionComponent>;
  let speechService, auditService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpokenPracticeQuestionComponent ],
      providers: [
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: AuditService, useClass: AuditServiceMock },
        WindowRefService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpokenPracticeQuestionComponent);
    component = fixture.componentInstance;

    speechService = fixture.debugElement.injector.get(SpeechService);
    auditService = fixture.debugElement.injector.get(AuditService);
    spyOn(speechService, 'speak');
    spyOn(auditService, 'addEntry');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should write an audit entry to show the question was rendered', () => {
    expect(auditService.addEntry).toHaveBeenCalledTimes(1);
  });

  it('should start speaking straight away', () => {
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
