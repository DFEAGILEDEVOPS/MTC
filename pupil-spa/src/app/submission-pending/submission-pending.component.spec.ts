import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { SubmissionPendingComponent } from './submission-pending.component';
import { SubmissionService } from '../services/submission/submission.service';
import { AuditService } from '../services/audit/audit.service';
import { SubmissionServiceMock } from '../services/submission/submission.service.mock';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SubmissionPendingComponent', () => {
  let fixture: ComponentFixture<SubmissionPendingComponent>;
  let submissionService;
  let auditService;
  let component;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmissionPendingComponent ],
      imports: [ RouterTestingModule.withRoutes([])],
      schemas: [ NO_ERRORS_SCHEMA ], // we don't need to test sub-components
      providers: [
        { provide: SubmissionService, useClass: SubmissionServiceMock },
        { provide: AuditService, useClass: AuditServiceMock },
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { } } } },
      ]
    })
    .compileComponents();
    router = TestBed.get(Router);
    activatedRoute = TestBed.get(ActivatedRoute);
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
      expect(component.title).toBe('You have finished the check');
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
    it('provides an appropriate title when a previous check is detected though a URL param', async () => {
      submissionService = fixture.debugElement.injector.get(SubmissionService);
      auditService = fixture.debugElement.injector.get(AuditService);
      spyOn(submissionService, 'submitData').and.returnValue({ toPromise: () => Promise.resolve('ok') });
      spyOn(component, 'loadComponent').and.returnValue(Promise.resolve());
      spyOn(component, 'sleep').and.returnValue(Promise.resolve());
      activatedRoute.snapshot.queryParams.unfinishedCheck = true;
      await component.ngOnInit();
      expect(component.title).toBe('Uploading previous check');
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
