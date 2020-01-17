import { TestBed } from '@angular/core/testing';
import { StorageService } from '../storage/storage.service';
import { CheckStatusService } from './check-status.service';
import * as localStorageFailedSubmissionMock from './local.storage.failed.submission.mock.json';

let checkStatusService: CheckStatusService;
let storageService: StorageService;

describe('CheckStatusService', () => {
  beforeEach(() => {
    const inject = TestBed.configureTestingModule({
        providers: [
          CheckStatusService,
          StorageService
        ]
      }
    );
    checkStatusService = inject.get(CheckStatusService);
    storageService = inject.get(StorageService);
  });
  it('should be created', () => {
    expect(checkStatusService).toBeTruthy();
  });
  describe('#hasUnfinishedCheck', () => {
    it('should return true if local storage submission pending entry is true', () => {
      spyOn(storageService, 'getPendingSubmission').and.returnValue(true);
      const hasUnfinishedCheck = checkStatusService.hasUnfinishedCheck();
      expect(hasUnfinishedCheck).toBeTruthy();
    });
    it('should return false if local storage is empty', () => {
      spyOn(storageService, 'getPendingSubmission');
      const hasUnfinishedCheck = checkStatusService.hasUnfinishedCheck();
      expect(hasUnfinishedCheck).toBeFalsy();
    });
  });
  describe('#hasFinishedCheck', () => {
    it('should return true if local storage submission completed entry is true', () => {
      spyOn(storageService, 'getCompletedSubmission').and.returnValue(true);
      const hasFinishedCheck = checkStatusService.hasFinishedCheck();
      expect(hasFinishedCheck).toBeTruthy();
    });
    it('should return false if local storage is empty', () => {
      spyOn(storageService, 'getCompletedSubmission');
      const hasFinishedCheck = checkStatusService.hasFinishedCheck();
      expect(hasFinishedCheck).toBeFalsy();
    });
  });
});
