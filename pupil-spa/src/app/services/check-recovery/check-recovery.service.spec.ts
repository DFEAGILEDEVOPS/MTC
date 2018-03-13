import { TestBed } from '@angular/core/testing';

import { StorageService } from '../storage/storage.service';
import { CheckRecoveryService } from './check-recovery.service';
import * as localStorageFailedSubmissionMock from './local.storage.failed.submission.mock.json';
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
  it('hasUnfinishedCheck should return true if local storage is still populated', () => {
    spyOn(storageService, 'getAllItems').and.returnValue(localStorageFailedSubmissionMock);
    const hasUnfinishedCheck = checkRecoveryService.hasUnfinishedCheck();
    expect(hasUnfinishedCheck).toBeTruthy();
  });
  it('hasUnfinishedCheck should return false if local storage is empty', () => {
    spyOn(storageService, 'getAllItems');
    const hasUnfinishedCheck = checkRecoveryService.hasUnfinishedCheck();
    expect(hasUnfinishedCheck).toBeFalsy();
  });
});
