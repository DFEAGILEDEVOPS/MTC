import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { InstructionsComponent } from './instructions.component';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { QuestionService } from '../services/question/question.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { AuditService } from '../services/audit/audit.service';
import { AppHidden, AppVisible, AuditEntry, WarmupStarted } from '../services/audit/auditEntry';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('InstructionsComponent', () => {
  let component: InstructionsComponent;
  let fixture: ComponentFixture<InstructionsComponent>;
  let mockRouter;
  let mockAuditService;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };
    const injector = TestBed.configureTestingModule({
      declarations: [InstructionsComponent],
      schemas: [ NO_ERRORS_SCHEMA ], // we don't need to test sub-components
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: AuditService, useClass : AuditServiceMock },
        { provide: SpeechService, useClass: SpeechServiceMock },
        WindowRefService
      ]
    });
    injector.compileComponents();
    mockAuditService = injector.get(AuditService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('redirects to practice questions instructions page', () => {
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
      expect(mockAuditService.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof WarmupStarted).toBeTruthy();
    });
  });
  describe('#visibilityChange', () => {
    const simulateHiddenDocument = () => {
      Object.defineProperty(document, 'visibilityState', {value: 'hidden', writable: true});
      Object.defineProperty(document, 'hidden', {value: true, writable: true});
      document.dispatchEvent(new Event('visibilitychange'));
    };
    const simulateVisibleDocument = () => {
      Object.defineProperty(document, 'visibilityState', {value: 'visible', writable: true});
      Object.defineProperty(document, 'hidden', {value: false, writable: true});
      document.dispatchEvent(new Event('visibilitychange'));
    };
    beforeEach(() => {
      simulateVisibleDocument();
    });
    it('should call auditService addEntry with AppHidden as audit entry if visibility is visible', async () => {
      const addEntrySpy = spyOn(mockAuditService, 'addEntry');
      simulateVisibleDocument();
      expect(addEntrySpy.calls.all()[0].args[0] instanceof AppVisible).toBeTruthy();
    });
    it('should call auditService addEntry with AppHidden as audit entry if visibility is hidden', async () => {
      const addEntrySpy = spyOn(mockAuditService, 'addEntry');
      simulateHiddenDocument();
      expect(addEntrySpy.calls.all()[0].args[0] instanceof AppHidden).toBeTruthy();
    });
  });
});
