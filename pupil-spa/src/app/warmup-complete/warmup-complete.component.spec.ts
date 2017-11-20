import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarmupCompleteComponent } from './warmup-complete.component';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { CheckStartedAPICallSucceeded, CheckStartedAPICallFailed } from '../services/audit/auditEntry';
import { SubmissionServiceMock } from '../services/submission/submission.service.mock';
import { SubmissionService } from '../services/submission/submission.service';
import { WarmupCompleteRendered, AuditEntry } from '../services/audit/auditEntry';


describe('WarmupCompleteComponent', () => {
  let component: WarmupCompleteComponent;
  let fixture: ComponentFixture<WarmupCompleteComponent>;
  let submissionService;
  let auditEntryInserted: AuditEntry;
  let auditService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarmupCompleteComponent ],
      providers: [
        { provide: AuditService, useClass: AuditServiceMock},
        { provide: SubmissionService, useClass: SubmissionServiceMock }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarmupCompleteComponent);
    component = fixture.componentInstance;
    auditService = fixture.debugElement.injector.get(AuditService);
    spyOn(auditService, 'addEntry').and.callFake((entry) => {
      auditEntryInserted = entry;
    });
    fixture.detectChanges();
  });
  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('onClick()', () => {
    describe('when submission service call succeeds', () => {
      beforeEach(() => {
        submissionService = fixture.debugElement.injector.get(SubmissionService);
        spyOn(submissionService, 'submitCheckStartData')
          .and.returnValue(Promise.resolve());
      });
      it('successfully calls submission service and audit service', async (() => {
        component.clickEvent.subscribe(g => {
          expect(g).toBe(null);
        });
        component.onClick();
        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(auditService.addEntry).toHaveBeenCalledTimes(4);
          expect(auditService.addEntry).toHaveBeenCalledWith(new CheckStartedAPICallSucceeded());
        });
        expect(submissionService.submitCheckStartData).toHaveBeenCalledTimes(1);
      }));
    });
    describe('when submission service call fails', () => {
      beforeEach(() => {
        submissionService = fixture.debugElement.injector.get(SubmissionService);
        spyOn(submissionService, 'submitCheckStartData')
          .and.returnValue(Promise.reject(new Error('Error')));
      });
      it('throws the error and logs in audit service the failure', async(() => {
        component.clickEvent.subscribe(g => {
          expect(g).toBe(null);
        });
        component.onClick();
        fixture.whenStable().catch(() => {
          fixture.detectChanges();
          expect(auditService.addEntry).toHaveBeenCalledTimes(2);
          expect(auditService.addEntry).toHaveBeenCalledWith(new CheckStartedAPICallFailed());
        });
        expect(submissionService.submitCheckStartData).toHaveBeenCalledTimes(1);
      }));
    });
  });

  describe('audit entry', () => {
    it('is added on WarmupComplete rendered', () => {
      expect(auditService.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof WarmupCompleteRendered).toBeTruthy();
    });
  });
});
