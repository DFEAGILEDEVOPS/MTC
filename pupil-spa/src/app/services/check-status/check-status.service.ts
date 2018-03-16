import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class CheckStatusService {

  constructor(private storageService: StorageService) {
  }

  hasUnfinishedCheck(): boolean {
    return this.storageService.getItem('pending_submission');
  }
}
