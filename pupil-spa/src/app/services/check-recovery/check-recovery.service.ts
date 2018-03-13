import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class CheckRecoveryService {

  constructor(private storageService: StorageService) {
  }

  hasUnfinishedCheck(): boolean {
    const localStorage = this.storageService.getAllItems();
    return localStorage && Object.keys(localStorage).length > 0;
  }
}
