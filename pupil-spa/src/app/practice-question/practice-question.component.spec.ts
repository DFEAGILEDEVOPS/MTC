import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeQuestionComponent } from './practice-question.component';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { WindowRefService } from '../services/window-ref/window-ref.service';

describe('PractiseQuestionComponent', () => {
  let component: PracticeQuestionComponent;
  let fixture: ComponentFixture<PracticeQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PracticeQuestionComponent ],
      providers: [
        { provide: AuditService, useClass: AuditServiceMock },
        WindowRefService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
