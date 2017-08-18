import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { InstructionsComponent } from './instructions.component';
import { QuestionServiceMock } from '../question.service.mock';
import { QuestionService } from '../question.service';
import { AuditServiceMock } from "../audit.service.mock";
import { AuditService } from "../audit.service";
import { AuditEntry, CheckStarted } from "../auditEntry";

describe('InstructionsComponent', () => {
  let component: InstructionsComponent;
  let fixture: ComponentFixture<InstructionsComponent>;
  let mockRouter;
  let auditServiceMock = new AuditServiceMock();

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };
    TestBed.configureTestingModule({
      declarations: [InstructionsComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: AuditService, useValue: auditServiceMock }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('redirects to warm up introduction page', () => {
    component.onClick();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['check']);
  });

  describe('audit entry', () => {
    let auditEntryInserted: AuditEntry;
    beforeEach(() => {
      let auditService = fixture.debugElement.injector.get(AuditService);
      spyOn(auditService, 'addEntry').and.callFake((entry) => {
        auditEntryInserted = entry;
      });
    });
    it('adds audit entry onClick for check started', () => {
      component.onClick();
      expect(auditServiceMock.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof CheckStarted).toBeTruthy();
    });
  });

});
