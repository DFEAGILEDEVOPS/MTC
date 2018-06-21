import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { QuestionsIntroComponent } from './questions-intro.component';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { AuditService } from '../services/audit/audit.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SubmissionServiceMock } from '../services/submission/submission.service.mock';
import { SubmissionService } from '../services/submission/submission.service';
import { AuditEntry, QuestionIntroRendered } from '../services/audit/auditEntry';
import 'rxjs/add/operator/toPromise';

describe('QuestionsIntroComponent', () => {
  let component: QuestionsIntroComponent;
  let fixture: ComponentFixture<QuestionsIntroComponent>;
  let submissionService;
  let auditEntryInserted: AuditEntry;
  let auditService;
  let addEntrySpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionsIntroComponent ],
      schemas: [ NO_ERRORS_SCHEMA ], // we don't need to test sub-components
      providers: [
        { provide: AuditService, useClass: AuditServiceMock},
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: SubmissionService, useClass: SubmissionServiceMock }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionsIntroComponent);
    component = fixture.componentInstance;
    auditService = fixture.debugElement.injector.get(AuditService);
    addEntrySpy = spyOn(auditService, 'addEntry').and.callFake((entry) => {
      auditEntryInserted = entry;
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onClick()', () => {
    describe('when submission service call succeeds', () => {
      beforeEach(() => {
        submissionService = fixture.debugElement.injector.get(SubmissionService);
        spyOn(submissionService, 'submitCheckStartData')
          .and.returnValue({ toPromise: () => Promise.resolve() });
      });
      it('successfully calls submission service and audit service', async (async() => {
        component.clickEvent.subscribe(g => {
          expect(g).toBe(null);
        });
        await component.onClick();
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(auditService.addEntry).toHaveBeenCalledTimes(4);
          expect(addEntrySpy.calls.all()[2].args[0].type).toEqual('CheckStartedAPICallSucceeded');
          expect(addEntrySpy.calls.all()[3].args[0].type).toEqual('CheckStartedApiCalled');
        });
        expect(submissionService.submitCheckStartData).toHaveBeenCalledTimes(1);
      }));
    });
    describe('when submission service call fails', () => {
      beforeEach(() => {
        submissionService = fixture.debugElement.injector.get(SubmissionService);
        spyOn(submissionService, 'submitCheckStartData')
          .and.returnValue({ toPromise: () => Promise.reject(new Error('Error')) });
      });
      it('throws the error and logs in audit service the failure', (async () => {
        component.clickEvent.subscribe(g => {
          expect(g).toBe(null);
        });
        await component.onClick();
        fixture.whenStable()
          .then(() => {
            expect(auditService.addEntry).toHaveBeenCalledTimes(3);
            expect(addEntrySpy.calls.all()[2].args[0].type).toEqual('CheckStartedApiCalled');
          });
        expect(submissionService.submitCheckStartData).toHaveBeenCalledTimes(1);
      }));
    });
  });

  describe('audit entry', () => {
    it('is added on WarmupComplete rendered', () => {
      expect(auditService.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof QuestionIntroRendered).toBeTruthy();
    });
  });
});
