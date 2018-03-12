import { TestBed } from '@angular/core/testing';

import { StorageService } from '../storage/storage.service';
import { CheckRecoveryService } from './check-recovery.service';
import * as auditFailedResponseMock from '../check-recovery/audit.failed.response.mock.json';
import * as auditSuccessResponseMock from '../check-recovery/audit.success.response.mock.json';
let storageService: StorageService;
let checkRecoveryService: CheckRecoveryService;

describe('CheckRecoveryService', () => {
  beforeEach(() => {
    const inject = TestBed.configureTestingModule({
        providers: [
          StorageService,
          CheckRecoveryService
        ]
      }
    );
    storageService = inject.get(StorageService);
    checkRecoveryService = inject.get(CheckRecoveryService);
  });
  it('hasUnfinishedCheck should return true if there is no CheckComplete entry in the audit', () => {
    spyOn(storageService, 'getItem').and.returnValue(auditFailedResponseMock);
    const hasUnfinishedCheck = checkRecoveryService.hasUnfinishedCheck();
    expect(hasUnfinishedCheck).toBeTruthy();
  });
  it('hasUnfinishedCheck should return false if there are no audit entries', () => {
    spyOn(storageService, 'getItem');
    const hasUnfinishedCheck = checkRecoveryService.hasUnfinishedCheck();
    expect(hasUnfinishedCheck).toBeFalsy();
  });
  it('hasUnfinishedCheck should return false if there CheckComplete entry in the audit', () => {
    spyOn(storageService, 'getItem').and.returnValue(auditSuccessResponseMock);
    const hasUnfinishedCheck = checkRecoveryService.hasUnfinishedCheck();
    expect(hasUnfinishedCheck).toBeFalsy();
  });
});
