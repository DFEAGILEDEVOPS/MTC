import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionFailedComponent } from './submission-failed.component';
import { AuditService } from '../services/audit/audit.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AppHidden, AppVisible } from '../services/audit/auditEntry';

describe('SubmissionFailedComponent', () => {
  let component: SubmissionFailedComponent;
  let fixture: ComponentFixture<SubmissionFailedComponent>;
  let mockAuditService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmissionFailedComponent ],
      schemas: [ NO_ERRORS_SCHEMA ], // we don't need to test sub-components
      providers: [
        { provide: AuditService, useClass: AuditServiceMock },
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        WindowRefService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionFailedComponent);
    component = fixture.componentInstance;
    mockAuditService = fixture.debugElement.injector.get(AuditService);
  });

  it('should be created', () => {
    spyOn(mockAuditService, 'addEntry');
    expect(component).toBeTruthy();
    component.ngOnInit();
    expect(mockAuditService.addEntry).toHaveBeenCalledTimes(1);
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
