import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionFailedComponent } from './submission-failed.component';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';

describe('SubmissionFailedComponent', () => {
  let component: SubmissionFailedComponent;
  let fixture: ComponentFixture<SubmissionFailedComponent>;
  let auditService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmissionFailedComponent ],
      providers: [
        { provide: AuditService, useClass: AuditServiceMock }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionFailedComponent);
    component = fixture.componentInstance;
    auditService = fixture.debugElement.injector.get(AuditService);
  });

  it('should be created', () => {
    spyOn(auditService, 'addEntry');
    expect(component).toBeTruthy();
    component.ngOnInit();
    expect(auditService.addEntry).toHaveBeenCalledTimes(1);
  });
});
