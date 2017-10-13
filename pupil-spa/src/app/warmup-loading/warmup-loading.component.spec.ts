import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarmupLoadingComponent } from './warmup-loading.component';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';


describe('WarmupLoadingComponent', () => {
  let component: WarmupLoadingComponent;
  let fixture: ComponentFixture<WarmupLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarmupLoadingComponent ],
      providers: [
        { provide: AuditService, useClass: AuditServiceMock }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarmupLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
