import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { AppHidden, AppVisible } from '../services/audit/auditEntry';
import { PageVisibilityComponent} from './page-visibility.component';

describe('PageVisibility', () => {
  let component: PageVisibilityComponent;
  let fixture: ComponentFixture<PageVisibilityComponent>;
  let mockAuditService;
  let mockRouter;

  beforeEach(async(() => {
    mockRouter = {
      url: ''
    };
    const injector = TestBed.configureTestingModule({
      declarations: [PageVisibilityComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: AuditService, useClass: AuditServiceMock},
        {provide: Router, useValue: mockRouter}
      ],
    });
    mockAuditService = injector.get(AuditService);
    mockRouter = injector.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageVisibilityComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#unloadNotification', () => {
    beforeEach(() => {
      mockRouter.url = '';
    });
    it('should call auditService addEntry when url is other than /check', async () => {
      spyOn(mockAuditService, 'addEntry');
      mockRouter.url = '/sign-in-success';
      component.unloadNotification();
      expect(mockAuditService.addEntry).toHaveBeenCalled();
    });
    it('should not call auditService addEntry when url is /check', async () => {
      spyOn(mockAuditService, 'addEntry');
      mockRouter.url = '/check';
      component.unloadNotification();
      expect(mockAuditService.addEntry).not.toHaveBeenCalled();
    });
  });

  describe('#visibilityChange', () => {
    const simulateHiddenDocument = () => {
      Object.defineProperty(document, 'visibilityState', {value: 'hidden', writable: true});
      Object.defineProperty(document, 'hidden', {value: true, writable: true});
      document.dispatchEvent(new Event('visibilitychange'));
    };
    const simulateVisibleDocument = () => {
      Object.defineProperty(document, 'visibilityState', {value: 'visible', writable: true});
      Object.defineProperty(document, 'hidden', {value: false, writable: true});
      document.dispatchEvent(new Event('visibilitychange'));
    };
    beforeEach(() => {
      simulateVisibleDocument();
    });
    it('should call auditService addEntry with AppHidden as audit entry if visibility is visible', async () => {
      const addEntrySpy = spyOn(mockAuditService, 'addEntry');
      simulateVisibleDocument();
      fixture.whenStable().then(() => {
        expect(addEntrySpy.calls.all()[0].args[0] instanceof AppVisible).toBeTruthy();
      });
    });
    it('should call auditService addEntry with AppHidden as audit entry if visibility is hidden', async () => {
      const addEntrySpy = spyOn(mockAuditService, 'addEntry');
      simulateHiddenDocument();
      fixture.whenStable().then(() => {
        expect(addEntrySpy.calls.all()[0].args[0] instanceof AppHidden).toBeTruthy();
      });
    });
  });
});
