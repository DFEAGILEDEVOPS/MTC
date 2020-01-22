import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { AppHidden, AppVisible } from '../services/audit/auditEntry';
import { PageVisibilityComponent} from './page-visibility.component';

describe('PageVisibility', () => {
  let component: PageVisibilityComponent;
  let fixture: ComponentFixture<PageVisibilityComponent>;
  let mockAuditService;

  beforeEach(async(() => {
    const injector = TestBed.configureTestingModule({
      declarations: [PageVisibilityComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: AuditService, useClass: AuditServiceMock}
      ],
    });
    mockAuditService = injector.get(AuditService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageVisibilityComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
