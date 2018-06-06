import { TestBed } from '@angular/core/testing';
import { StorageServiceMock } from '../storage/storage.service.mock';
import { StorageService } from '../storage/storage.service';
import { CheckStatusService } from './check-status.service';
import * as localStorageFailedSubmissionMock from './local.storage.failed.submission.mock.json';

let checkStatusService: CheckStatusService;
let mockStorageService: StorageServiceMock;

describe('CheckStatusService', () => {
  beforeEach(() => {
    mockStorageService = new StorageServiceMock();
    const inject = TestBed.configureTestingModule({
        providers: [
          CheckStatusService,
          { provide: StorageService, useValue: mockStorageService }
        ]
      }
    );
    checkStatusService = inject.get(CheckStatusService);
  });
  it('should be created', () => {
    expect(checkStatusService).toBeTruthy();
  });
  describe('#hasUnfinishedCheck', () => {
    it('should return true if local storage submission pending entry is true', () => {
      spyOn(mockStorageService, 'getItem').and.returnValue(true);
      const hasUnfinishedCheck = checkStatusService.hasUnfinishedCheck();
      expect(hasUnfinishedCheck).toBeTruthy();
    });
    it('should return false if local storage is empty', () => {
      spyOn(mockStorageService, 'getItem');
      const hasUnfinishedCheck = checkStatusService.hasUnfinishedCheck();
      expect(hasUnfinishedCheck).toBeFalsy();
    });
  });
  describe('#hasFinishedCheck', () => {
    it('should return true if local storage submission completed entry is true', () => {
      spyOn(mockStorageService, 'getItem').and.returnValue(true);
      const hasFinishedCheck = checkStatusService.hasFinishedCheck();
      expect(hasFinishedCheck).toBeTruthy();
    });
    it('should return false if local storage is empty', () => {
      spyOn(mockStorageService, 'getItem');
      const hasFinishedCheck = checkStatusService.hasFinishedCheck();
      expect(hasFinishedCheck).toBeFalsy();
    });
  });
});
