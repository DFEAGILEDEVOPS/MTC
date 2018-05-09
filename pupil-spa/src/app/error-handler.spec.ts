import { TestBed } from '@angular/core/testing';
import { LocationStrategy } from '@angular/common';

import { GlobalErrorHandler } from './error-handler';
import { AuditService } from './services/audit/audit.service';
import { AuditServiceMock } from './services/audit/audit.service.mock';
import { WindowRefService } from './services/window-ref/window-ref.service';

describe('error-handler', () => {
  let errorHandler: GlobalErrorHandler;
  let auditServiceMock: AuditServiceMock;

  beforeEach(() => {
    auditServiceMock = new AuditServiceMock();
    console.log('auditServiceMock created', auditServiceMock);
    const injector = TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        {useValue: auditServiceMock, provide: AuditService},
        {useClass: WindowRefService, provide: WindowRefService},
        {useClass: LocationStrategy, provide: LocationStrategy}
      ]
    });

    errorHandler = injector.get(GlobalErrorHandler);
  });

  it('should be created', () => {
    expect(errorHandler).toBeTruthy();
  });

  it ('handleError calls the audit service to persist the error', () => {
    spyOn(auditServiceMock, 'addEntry');
    errorHandler.handleError(new Error('a mock error from unit testing'));
    expect(auditServiceMock.addEntry).toHaveBeenCalled();
  });

  it ('handleError does not throw another error', () => {
    try {
      errorHandler.handleError(new Error('a mock error from unit testing'));
    } catch (error) {
      fail(error);
    }
  });
});
