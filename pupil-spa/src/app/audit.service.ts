import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { AuditEntry, AuditEntryType } from './auditEntry';

@Injectable()
export class AuditService {

  constructor(private storageService: StorageService) { }

  addEntry(auditEntry: AuditEntry): void {
    let existingEntries = this.storageService.getItem('audit') as Array<AuditEntry>;
    if (!existingEntries) {
      existingEntries = new Array<AuditEntry>();
    }
    existingEntries.push(auditEntry);
    this.storageService.setItem('audit', existingEntries);
  }
}
