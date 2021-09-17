import { Injectable } from '@angular/core';
import { AuditEntry, AuditEntryType } from './auditEntry';

@Injectable()
export class AuditServiceMock {
  addEntry(auditEntry: AuditEntry): void {}
}
