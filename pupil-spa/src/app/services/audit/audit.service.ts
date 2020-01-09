import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { AuditEntry } from './auditEntry';

@Injectable()
export class AuditService {
  constructor(private storageService: StorageService) { }

  addEntry(auditEntry: AuditEntry): void {
    this.storageService.setAuditEntry(auditEntry);
  }
}
