import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingComponent } from './loading.component';
import { AuditServiceMock } from "../audit.service.mock";
import { AuditService } from "../audit.service";

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
    fixture.detectChanges();
    // prevent setTimeout's being set
    spyOn(component, 'ngAfterViewInit').and.returnValue(null);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should add audit entry when loading rendered', () => {

  });
});
