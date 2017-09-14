import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckCompleteComponent } from './check-complete.component';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { AuditEntry } from '../services/audit/auditEntry';
import { CheckCompleteRendered } from '../services/audit/auditEntry';

describe('CheckCompleteComponent', () => {
  let component: CheckCompleteComponent;
  let fixture: ComponentFixture<CheckCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckCompleteComponent ],
      providers: [
        { provide: AuditService, useClass: AuditServiceMock }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('audit entry', () => {
    let auditEntryInserted: AuditEntry;
    let auditService: AuditService;
    beforeEach(() => {
      auditService = fixture.debugElement.injector.get(AuditService);
      spyOn(auditService, 'addEntry').and.callFake((entry) => {
        auditEntryInserted = entry;
      });
    });
    it('is added on component render', () => {
      component.ngAfterViewInit();
      expect(auditService.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof CheckCompleteRendered).toBeTruthy();
    });
  });
});
