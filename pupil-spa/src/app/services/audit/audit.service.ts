import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import * as AuditTypes from './auditEntry';
import { AuditEntry } from './auditEntry';

@Injectable()
export class AuditService {

  constructor(private storageService: StorageService) { }

  addEntry(auditEntry: AuditEntry): void {
    let existingEntries = this.storageService.getItem('audit') as Array<AuditTypes.AuditEntry>;
    if (!existingEntries) {
      existingEntries = new Array<AuditTypes.AuditEntry>();
    }
    existingEntries.push(auditEntry);
    this.storageService.setItem('audit', existingEntries);
  }
}
