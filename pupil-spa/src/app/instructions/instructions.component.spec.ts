import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { InstructionsComponent } from './instructions.component';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { QuestionService } from '../services/question/question.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { AuditService } from '../services/audit/audit.service';
import { AuditEntry, WarmupStarted } from '../services/audit/auditEntry';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { WindowRefService } from '../services/window-ref/window-ref.service';

describe('InstructionsComponent', () => {
  let component: InstructionsComponent;
  let fixture: ComponentFixture<InstructionsComponent>;
  let mockRouter;
  const auditServiceMock = new AuditServiceMock();

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };
    TestBed.configureTestingModule({
      declarations: [InstructionsComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: AuditService, useValue: auditServiceMock },
        { provide: SpeechService, useClass: SpeechServiceMock },
        WindowRefService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('redirects to warm up introduction page', () => {
    component.onClick();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['check']);
  });

  describe('audit entry', () => {
    let auditEntryInserted: AuditEntry;
    beforeEach(() => {
      const auditService = fixture.debugElement.injector.get(AuditService);
      spyOn(auditService, 'addEntry').and.callFake((entry) => {
        auditEntryInserted = entry;
      });
    });
    it('adds audit entry onClick for check started', () => {
      component.onClick();
      expect(auditServiceMock.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof WarmupStarted).toBeTruthy();
    });
  });

});
