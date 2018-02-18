import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckCompleteComponent } from './check-complete.component';
import { AuditService } from '../services/audit/audit.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';

describe('CheckCompleteComponent', () => {
  let component: CheckCompleteComponent;
  let fixture: ComponentFixture<CheckCompleteComponent>;
  let auditService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckCompleteComponent ],
      providers: [
        { provide: AuditService, useClass: AuditServiceMock },
        WindowRefService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckCompleteComponent);
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
