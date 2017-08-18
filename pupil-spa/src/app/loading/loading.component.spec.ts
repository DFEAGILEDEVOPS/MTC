import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingComponent } from './loading.component';
import { AuditServiceMock } from '../audit.service.mock';
import { AuditService } from '../audit.service';
import { AuditEntry, PauseRendered } from '../auditEntry';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;
  let auditServiceMock = new AuditServiceMock();

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [LoadingComponent],
      providers: [
        { provide: AuditService, useValue: auditServiceMock }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    auditServiceMock = fixture.debugElement.injector.get(AuditService);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should add audit entry when loading rendered', () => {
    let auditEntryInserted: AuditEntry;
    spyOn(auditServiceMock, 'addEntry').and.callFake((entry) => {
      auditEntryInserted = entry;
    });
    component.ngAfterViewInit();
    expect(auditServiceMock.addEntry).toHaveBeenCalledTimes(1);
    expect(auditEntryInserted instanceof PauseRendered).toBeTruthy();
  });
});
