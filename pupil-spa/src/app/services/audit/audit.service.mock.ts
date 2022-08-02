import { Injectable } from '@angular/core';
import { AuditEntry } from './auditEntry';

@Injectable()
export class AuditServiceMock {
  addEntry(auditEntry: AuditEntry): void {}
}
