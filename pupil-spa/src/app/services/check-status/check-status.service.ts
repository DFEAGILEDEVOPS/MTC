import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { CompletedSubmissionStorageKey, PendingSubmissionStorageKey } from '../storage/storageKey';

@Injectable()
export class CheckStatusService {

  constructor(private storageService: StorageService) {
  }

  hasUnfinishedCheck(): boolean {
    return this.storageService.getItem(new PendingSubmissionStorageKey());
  }

  hasFinishedCheck(): boolean {
    return this.storageService.getItem(new CompletedSubmissionStorageKey());
  }
}
