import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class CheckRecoveryService {

  constructor(private storageService: StorageService) {
  }

  hasUnfinishedCheck(): boolean {
    const audits = this.storageService.getItem('audit');
    if (!audits || audits.length === 0) {
      return false;
    }
    return !audits.find(a => a.type === 'CheckComplete');
  }
}
