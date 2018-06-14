import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuditService } from '../services/audit/audit.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

import { PracticeInstructionsComponent } from './practice-instructions.component';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { AuditEntry, WarmupStarted } from '../services/audit/auditEntry';

describe('PracticeQuestionsInstructionsComponent', () => {
  let component: PracticeInstructionsComponent;
  let fixture: ComponentFixture<PracticeInstructionsComponent>;
  let mockRouter;
  const auditServiceMock = new AuditServiceMock();

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };
    TestBed.configureTestingModule({
      declarations: [ PracticeInstructionsComponent ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuditService, useValue: auditServiceMock },
        WindowRefService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('redirects to practice questions page', () => {
    component.onClick();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['check']);
  });

  describe('audit entry', () => {
    let auditEntryInserted: AuditEntry;
    beforeEach(() => {
      const auditService = fixture.debugElement.injector.get(AuditService);
      spyOn(auditService, 'addEntry').and.callFake((entry) => {
        auditEntryInserted = entry;
      });
    });
    it('adds audit entry onClick for check started', () => {
      component.onClick();
      expect(auditServiceMock.addEntry).toHaveBeenCalledTimes(1);
      expect(auditEntryInserted instanceof WarmupStarted).toBeTruthy();
    });
  });
});
