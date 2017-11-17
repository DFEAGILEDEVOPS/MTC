import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarmupCompleteComponent } from './warmup-complete.component';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { SubmissionServiceMock } from '../services/submission/submission.service.mock';
import { SubmissionService } from '../services/submission/submission.service';
import { WarmupCompleteRendered, AuditEntry } from '../services/audit/auditEntry';


describe('WarmupCompleteComponent', () => {
  let component: WarmupCompleteComponent;
  let fixture: ComponentFixture<WarmupCompleteComponent>;
  let submissionService;

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
    fixture.detectChanges();
    submissionService = fixture.debugElement.injector.get(SubmissionService);
    spyOn(submissionService, 'submitCheckStartData').and.returnValue(Promise.resolve());
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('emits onClick()', async (() => {
    component.clickEvent.subscribe( g => {
      expect(g).toBe(null);
    });
    component.onClick();
    expect(submissionService.submitCheckStartData).toHaveBeenCalledTimes(1);
  }));

  describe('audit entry', () => {
    let auditEntryInserted: AuditEntry;
    let auditService;
    beforeEach(() => {
      auditService = fixture.debugElement.injector.get(AuditService);
      spyOn(auditService, 'addEntry').and.callFake((entry) => {
        auditEntryInserted = entry;
      });
    });
    it('is added on WarmupComplete rendered', () => {
      component.ngAfterViewInit();
      expect(auditService.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof WarmupCompleteRendered).toBeTruthy();
    });
  });
});
