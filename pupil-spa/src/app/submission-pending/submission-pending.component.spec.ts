import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { SubmissionPendingComponent } from './submission-pending.component';
import { SubmissionService } from '../services/submission/submission.service';
import { AuditService } from '../services/audit/audit.service';
import { SubmissionServiceMock } from '../services/submission/submission.service.mock';
import { AuditServiceMock } from '../services/audit/audit.service.mock';

describe('SubmissionPendingComponent', () => {
  let fixture: ComponentFixture<SubmissionPendingComponent>;
  let submissionService;
  let auditService;
  let component;
  let router: Router;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmissionPendingComponent ],
      imports: [    RouterTestingModule.withRoutes([])],
      providers: [
        { provide: SubmissionService, useClass: SubmissionServiceMock },
        { provide: AuditService, useClass: AuditServiceMock }
      ]
    })
    .compileComponents();
    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionPendingComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit()', () => {
    it('calls loadComponent method when data submission is successful', async () => {
      submissionService = fixture.debugElement.injector.get(SubmissionService);
      auditService = fixture.debugElement.injector.get(AuditService);
      spyOn(submissionService, 'submitData').and.returnValue({ toPromise: () => Promise.resolve('ok') });
      spyOn(component, 'loadComponent').and.returnValue(Promise.resolve());
      spyOn(component, 'sleep').and.returnValue(Promise.resolve());
      spyOn(auditService, 'addEntry');
      await component.ngOnInit();
      expect(submissionService.submitData).toHaveBeenCalled();
      expect(component.loadComponent).toHaveBeenCalledWith(true);
      expect(component.loadComponent).toHaveBeenCalledTimes(1);
      expect(auditService.addEntry).toHaveBeenCalledTimes(2);
    });
    it('calls loadComponent method when data submission throws an error', async () => {
      submissionService = fixture.debugElement.injector.get(SubmissionService);
      auditService = fixture.debugElement.injector.get(AuditService);
      spyOn(submissionService, 'submitData').and.returnValue({ toPromise: () => Promise.reject(new Error('Error')) });
      spyOn(component, 'loadComponent').and.returnValue(Promise.resolve());
      spyOn(component, 'sleep').and.returnValue(Promise.resolve());
      spyOn(auditService, 'addEntry');
      await component.ngOnInit();
      expect(submissionService.submitData).toHaveBeenCalled();
      expect(component.loadComponent).toHaveBeenCalledWith(false);
      expect(component.loadComponent).toHaveBeenCalledTimes(1);
      expect(auditService.addEntry).toHaveBeenCalledTimes(1);
    });
  });
  describe('loadComponent()', () => {
    it('calls router navigate with check complete url path',  async () => {
      spyOn(router, 'navigate');
      await component.loadComponent(true);
      expect(router.navigate).toHaveBeenCalledWith(['/check-complete']);
    });
    it('calls router navigate with submission failed url path',  async () => {
      spyOn(router, 'navigate');
      await component.loadComponent(false);
      expect(router.navigate).toHaveBeenCalledWith(['/submission-failed']);
    });
  });
});
